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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post(':videoId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create comment' })
  async create(
    @Param('videoId') videoId: string,
    @Req() req: any,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.create(videoId, req.user.userId, createCommentDto);
  }

  @Get(':videoId')
  @ApiOperation({ summary: 'Get video comments' })
  async findByVideo(@Param('videoId') videoId: string) {
    return this.commentsService.findByVideo(videoId);
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
}


