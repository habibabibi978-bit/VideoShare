import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CommentLikesService } from './comment-likes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly commentLikesService: CommentLikesService,
  ) {}

  // More specific routes must come before generic :videoId route
  // Using explicit path pattern similar to likes controller to avoid route conflicts
  @Post('toggle-comment-like/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle comment like' })
  async toggleLike(@Param('id') commentId: string, @Req() req: any) {
    return this.commentLikesService.toggleLike(commentId, req.user.userId);
  }

  @Post('toggle-comment-dislike/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle comment dislike' })
  async toggleDislike(@Param('id') commentId: string, @Req() req: any) {
    return this.commentLikesService.toggleDislike(commentId, req.user.userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update comment' })
  async update(
    @Param('id') id: string,
    @Req() req: any,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentsService.update(id, req.user.userId, updateCommentDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete comment' })
  async delete(@Param('id') id: string, @Req() req: any) {
    await this.commentsService.delete(id, req.user.userId);
    return { message: 'Comment deleted successfully' };
  }

  @Post('video/:videoId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create comment' })
  async create(
    @Param('videoId') videoId: string,
    @Req() req: any,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const comment = await this.commentsService.create(videoId, req.user.userId, createCommentDto);
    return { data: comment };
  }

  @Get(':videoId')
  @ApiOperation({ summary: 'Get video comments' })
  async findByVideo(@Param('videoId') videoId: string, @Req() req: any) {
    const userId = req.user?.userId;
    const comments = await this.commentsService.findByVideo(videoId, userId);
    return { data: { comments } };
  }
}


