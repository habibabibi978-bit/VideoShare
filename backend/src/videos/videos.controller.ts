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
    const videoFile = files.find((f) => f.fieldname === 'videoFile' || f.mimetype.startsWith('video/'));
    const thumbnail = files.find((f) => f.fieldname === 'thumbnail' || f.mimetype.startsWith('image/'));

    if (!videoFile) {
      throw new Error('Video file is required');
    }

    const videoUrl = await this.cloudinaryService.uploadVideo(videoFile);
    const thumbnailUrl = thumbnail
      ? await this.cloudinaryService.uploadImage(thumbnail, 'thumbnails')
      : '';

    return this.videosService.create(createVideoDto, req.user.userId, videoUrl, thumbnailUrl);
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

  @Get(':id')
  @ApiOperation({ summary: 'Get video by ID' })
  async findById(@Param('id') id: string) {
    return this.videosService.findById(id);
  }

  @Get('related/:id')
  @ApiOperation({ summary: 'Get related videos' })
  async findRelated(@Param('id') id: string, @Query('limit') limit: string) {
    return this.videosService.findRelated(id, parseInt(limit) || 10);
  }

  @Get('subscribedVideos')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get subscribed channels videos' })
  async getSubscribedVideos(@Req() req: any, @Query('page') page: string, @Query('limit') limit: string) {
    return this.videosService.getSubscribedVideos(req.user.userId, parseInt(page) || 1, parseInt(limit) || 20);
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


