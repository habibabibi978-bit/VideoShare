import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CommentLike, CommentLikeType } from '../entities/comment-like.entity';
import { Comment } from '../entities/comment.entity';

@Injectable()
export class CommentLikesService {
  constructor(
    @InjectRepository(CommentLike)
    private commentLikeRepository: Repository<CommentLike>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {}

  async toggleLike(commentId: string, userId: string) {
    const existingLike = await this.commentLikeRepository.findOne({
      where: { commentId, ownerId: userId, type: CommentLikeType.LIKE },
    });

    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (existingLike) {
      await this.commentLikeRepository.delete(existingLike.id);
      comment.likesCount = Math.max(0, comment.likesCount - 1);
      await this.commentRepository.save(comment);
      return { liked: false, likesCount: comment.likesCount, dislikesCount: comment.dislikesCount };
    } else {
      // Remove any existing dislike
      const existingDislike = await this.commentLikeRepository.findOne({
        where: { commentId, ownerId: userId, type: CommentLikeType.DISLIKE },
      });
      
      if (existingDislike) {
        await this.commentLikeRepository.delete(existingDislike.id);
        comment.dislikesCount = Math.max(0, comment.dislikesCount - 1);
      }

      const like = this.commentLikeRepository.create({
        commentId,
        ownerId: userId,
        type: CommentLikeType.LIKE,
      });
      await this.commentLikeRepository.save(like);
      comment.likesCount = (comment.likesCount || 0) + 1;
      await this.commentRepository.save(comment);
      return { liked: true, likesCount: comment.likesCount, dislikesCount: comment.dislikesCount };
    }
  }

  async toggleDislike(commentId: string, userId: string) {
    const existingDislike = await this.commentLikeRepository.findOne({
      where: { commentId, ownerId: userId, type: CommentLikeType.DISLIKE },
    });

    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (existingDislike) {
      await this.commentLikeRepository.delete(existingDislike.id);
      comment.dislikesCount = Math.max(0, comment.dislikesCount - 1);
      await this.commentRepository.save(comment);
      return { disliked: false, dislikesCount: comment.dislikesCount, likesCount: comment.likesCount };
    } else {
      // Remove any existing like
      const existingLike = await this.commentLikeRepository.findOne({
        where: { commentId, ownerId: userId, type: CommentLikeType.LIKE },
      });
      
      if (existingLike) {
        await this.commentLikeRepository.delete(existingLike.id);
        comment.likesCount = Math.max(0, comment.likesCount - 1);
      }

      const dislike = this.commentLikeRepository.create({
        commentId,
        ownerId: userId,
        type: CommentLikeType.DISLIKE,
      });
      await this.commentLikeRepository.save(dislike);
      comment.dislikesCount = (comment.dislikesCount || 0) + 1;
      await this.commentRepository.save(comment);
      return { disliked: true, dislikesCount: comment.dislikesCount, likesCount: comment.likesCount };
    }
  }

  async getUserCommentLikes(userId: string, commentIds: string[]) {
    if (commentIds.length === 0) return [];
    
    const likes = await this.commentLikeRepository.find({
      where: {
        ownerId: userId,
        commentId: In(commentIds),
      },
    });

    return likes;
  }
}

