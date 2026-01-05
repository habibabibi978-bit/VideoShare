import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Req,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VideosService } from './videos.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateVideoDto } from './dto/create-video.dto';

@ApiTags('Videos')
@Controller('videos')
export class VideosController {
  constructor(
    private readonly videosService: VideosService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('files', 2))
  @ApiOperation({ summary: 'Upload video' })
  async uploadVideo(
    @Req() req: any,
    @Body() createVideoDto: CreateVideoDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required');
    }

    // Find video file by mimetype (since all files are sent as 'files')
    const videoFile = files.find((f) => f.mimetype.startsWith('video/'));
    // Find thumbnail by mimetype
    const thumbnail = files.find((f) => f.mimetype.startsWith('image/'));

    if (!videoFile) {
      throw new BadRequestException('Video file is required. Please upload a video file.');
    }

    try {
      const videoUrl = await this.cloudinaryService.uploadVideo(videoFile);
      const thumbnailUrl = thumbnail
        ? await this.cloudinaryService.uploadImage(thumbnail, 'thumbnails')
        : '';

      return this.videosService.create(createVideoDto, req.user.userId, videoUrl, thumbnailUrl);
    } catch (error) {
      if (error.message.includes('Cloudinary is not configured')) {
        throw new BadRequestException('Cloudinary is not configured. Please configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.');
      }
      throw new BadRequestException(error.message || 'Failed to upload video');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all videos' })
  async findAll(@Query('page') page: string, @Query('limit') limit: string) {
    return this.videosService.findAll(parseInt(page) || 1, parseInt(limit) || 20);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search videos' })
  async search(
    @Query('q') query: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.videosService.search(query, parseInt(page) || 1, parseInt(limit) || 20);
  }

  @Get('subscribedVideos')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get subscribed channels videos' })
  async getSubscribedVideos(@Req() req: any, @Query('page') page: string, @Query('limit') limit: string) {
    try {
      console.log('getSubscribedVideos controller: Request received');
      console.log('getSubscribedVideos controller: req.user:', req.user);
      console.log('getSubscribedVideos controller: req.user?.userId:', req.user?.userId);
      
      if (!req.user || !req.user.userId) {
        console.error('getSubscribedVideos controller: User authentication failed - req.user:', req.user);
        throw new UnauthorizedException('User authentication required');
      }
      
      const userId = req.user.userId;
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 20;
      
      console.log(`getSubscribedVideos controller: Calling service with userId: ${userId}, page: ${pageNum}, limit: ${limitNum}`);
      
      return await this.videosService.getSubscribedVideos(userId, pageNum, limitNum);
    } catch (error) {
      console.error('Error in getSubscribedVideos controller:', error);
      console.error('Error message:', error.message);
      console.error('Error name:', error.name);
      console.error('Error stack:', error.stack);
      console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      
      // Preserve the original error message with more context
      let errorMessage = 'Failed to fetch subscribed videos';
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      console.error('Throwing InternalServerErrorException with message:', errorMessage);
      console.error('Full error for debugging:', {
        message: errorMessage,
        originalError: error?.message,
        name: error?.name,
        stack: error?.stack?.substring(0, 500), // First 500 chars of stack
      });
      
      // InternalServerErrorException - include detailed message
      const detailedMessage = errorMessage || 'Unknown error occurred';
      throw new InternalServerErrorException(detailedMessage);
    }
  }

  @Get('related/:id')
  @ApiOperation({ summary: 'Get related videos' })
  async findRelated(@Param('id') id: string, @Query('limit') limit: string) {
    return this.videosService.findRelated(id, parseInt(limit) || 10);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get video by ID' })
  async findById(@Param('id') id: string) {
    return this.videosService.findById(id);
  }

  @Patch('incrementViewCount/:id')
  @ApiOperation({ summary: 'Increment video view count' })
  async incrementViewCount(@Param('id') id: string) {
    return this.videosService.incrementViewCount(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete video' })
  async delete(@Param('id') id: string, @Req() req: any) {
    await this.videosService.delete(id, req.user.userId);
    return { message: 'Video deleted successfully' };
  }
}


