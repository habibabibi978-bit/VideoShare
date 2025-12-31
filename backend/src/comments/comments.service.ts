import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {}

  async create(videoId: string, userId: string, createCommentDto: CreateCommentDto) {
    const comment = this.commentRepository.create({
      ...createCommentDto,
      videoId,
      ownerId: userId,
    });
    return this.commentRepository.save(comment);
  }

  async findByVideo(videoId: string) {
    return this.commentRepository.find({
      where: { videoId },
      relations: ['owner'],
      order: { createdAt: 'DESC' },
    });
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


