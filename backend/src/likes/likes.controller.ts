import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Likes')
@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post('toggle-video-like/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle video like' })
  async toggleLike(@Param('id') videoId: string, @Req() req: any) {
    return this.likesService.toggleLike(videoId, req.user.userId);
  }

  @Post('toggle-video-dislike/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle video dislike' })
  async toggleDislike(@Param('id') videoId: string, @Req() req: any) {
    return this.likesService.toggleDislike(videoId, req.user.userId);
  }

  @Get('liked-videos')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get liked videos' })
  async getLikedVideos(@Req() req: any) {
    return { likedVideos: await this.likesService.getLikedVideos(req.user.userId) };
  }

  @Get('disliked-videos')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get disliked videos' })
  async getDislikedVideos(@Req() req: any) {
    return { dislikedVideos: await this.likesService.getDislikedVideos(req.user.userId) };
  }
}


