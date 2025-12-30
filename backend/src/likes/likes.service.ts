import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Like, LikeDocument } from '../schemas/like.schema';
import { Video, VideoDocument } from '../schemas/video.schema';

@Injectable()
export class LikesService {
  constructor(
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
    @InjectModel(Video.name) private videoModel: Model<VideoDocument>,
  ) {}

  async toggleLike(videoId: string, userId: string) {
    const existingLike = await this.likeModel.findOne({
      video: videoId,
      owner: userId,
      type: 'like',
    });

    if (existingLike) {
      await this.likeModel.findByIdAndDelete(existingLike._id);
      return { liked: false };
    } else {
      // Remove any existing dislike
      await this.likeModel.deleteOne({
        video: videoId,
        owner: userId,
        type: 'dislike',
      });

      await this.likeModel.create({
        video: videoId,
        owner: userId,
        type: 'like',
      });
      return { liked: true };
    }
  }

  async toggleDislike(videoId: string, userId: string) {
    const existingDislike = await this.likeModel.findOne({
      video: videoId,
      owner: userId,
      type: 'dislike',
    });

    if (existingDislike) {
      await this.likeModel.findByIdAndDelete(existingDislike._id);
      return { disliked: false };
    } else {
      // Remove any existing like
      await this.likeModel.deleteOne({
        video: videoId,
        owner: userId,
        type: 'like',
      });

      await this.likeModel.create({
        video: videoId,
        owner: userId,
        type: 'dislike',
      });
      return { disliked: true };
    }
  }

  async getLikedVideos(userId: string) {
    const likes = await this.likeModel
      .find({ owner: userId, type: 'like' })
      .populate({
        path: 'video',
        populate: { path: 'owner', select: 'username fullname avatar' },
      })
      .sort({ createdAt: -1 });

    return likes.map((like) => like.video).filter((video) => video);
  }

  async getDislikedVideos(userId: string) {
    const dislikes = await this.likeModel
      .find({ owner: userId, type: 'dislike' })
      .populate({
        path: 'video',
        populate: { path: 'owner', select: 'username fullname avatar' },
      })
      .sort({ createdAt: -1 });

    return dislikes.map((dislike) => dislike.video).filter((video) => video);
  }
}


