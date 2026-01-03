import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentLikesService } from './comment-likes.service';
import { CommentLikeType } from '../entities/comment-like.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    private commentLikesService: CommentLikesService,
  ) {}

  async create(videoId: string, userId: string, createCommentDto: CreateCommentDto) {
    const comment = this.commentRepository.create({
      content: createCommentDto.content,
      videoId,
      ownerId: userId,
      parentId: createCommentDto.parentId || undefined,
      likesCount: 0,
      dislikesCount: 0,
    });
    const savedComment = await this.commentRepository.save(comment);
    return this.commentRepository.findOne({
      where: { id: savedComment.id },
      relations: ['owner'],
    });
  }

  async findByVideo(videoId: string, userId?: string) {
    const comments = await this.commentRepository.find({
      where: { videoId, parentId: IsNull() },
      relations: ['owner'],
      order: { createdAt: 'DESC' },
    });

    // Get replies and user like status for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await this.commentRepository.find({
          where: { parentId: comment.id },
          relations: ['owner'],
          order: { createdAt: 'ASC' },
        });

        // Get user's like status for comment
        let userLikeStatus: CommentLikeType | null = null;
        if (userId) {
          const userLikes = await this.commentLikesService.getUserCommentLikes(userId, [comment.id]);
          if (userLikes.length > 0) {
            userLikeStatus = userLikes[0].type;
          }
        }

        // Ensure all fields are explicitly included, especially id
        return {
          id: comment.id,
          videoId: comment.videoId,
          ownerId: comment.ownerId,
          content: comment.content,
          parentId: comment.parentId,
          likesCount: comment.likesCount || 0,
          dislikesCount: comment.dislikesCount || 0,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
          owner: comment.owner,
          replies: replies || [],
          userLikeStatus,
        };
      })
    );

    return commentsWithReplies;
  }

  async update(id: string, userId: string, updateCommentDto: UpdateCommentDto) {
    const comment = await this.commentRepository.findOne({
      where: { id },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.ownerId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    comment.content = updateCommentDto.content;
    return this.commentRepository.save(comment);
  }

  async delete(id: string, userId: string) {
    const comment = await this.commentRepository.findOne({
      where: { id },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.ownerId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentRepository.delete(id);
  }
}


