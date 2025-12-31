import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like, LikeType } from '../entities/like.entity';
import { Video } from '../entities/video.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
  ) {}

  async toggleLike(videoId: string, userId: string) {
    const existingLike = await this.likeRepository.findOne({
      where: { videoId, ownerId: userId, type: LikeType.LIKE },
    });

    if (existingLike) {
      await this.likeRepository.delete(existingLike.id);
      return { liked: false };
    } else {
      // Remove any existing dislike
      await this.likeRepository.delete({
        videoId,
        ownerId: userId,
        type: LikeType.DISLIKE,
      });

      const like = this.likeRepository.create({
        videoId,
        ownerId: userId,
        type: LikeType.LIKE,
      });
      await this.likeRepository.save(like);
      return { liked: true };
    }
  }

  async toggleDislike(videoId: string, userId: string) {
    const existingDislike = await this.likeRepository.findOne({
      where: { videoId, ownerId: userId, type: LikeType.DISLIKE },
    });

    if (existingDislike) {
      await this.likeRepository.delete(existingDislike.id);
      return { disliked: false };
    } else {
      // Remove any existing like
      await this.likeRepository.delete({
        videoId,
        ownerId: userId,
        type: LikeType.LIKE,
      });

      const dislike = this.likeRepository.create({
        videoId,
        ownerId: userId,
        type: LikeType.DISLIKE,
      });
      await this.likeRepository.save(dislike);
      return { disliked: true };
    }
  }

  async getLikedVideos(userId: string) {
    const likes = await this.likeRepository.find({
      where: { ownerId: userId, type: LikeType.LIKE },
      relations: ['video', 'video.owner'],
      order: { createdAt: 'DESC' },
    });

    return likes.map((like) => like.video).filter((video) => video);
  }

  async getDislikedVideos(userId: string) {
    const dislikes = await this.likeRepository.find({
      where: { ownerId: userId, type: LikeType.DISLIKE },
      relations: ['video', 'video.owner'],
      order: { createdAt: 'DESC' },
    });

    return dislikes.map((dislike) => dislike.video).filter((video) => video);
  }
}


