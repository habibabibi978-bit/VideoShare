import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Video, VideoDocument } from '../schemas/video.schema';
import { CreateVideoDto } from './dto/create-video.dto';
import { Like, LikeDocument } from '../schemas/like.schema';
import { Subscription, SubscriptionDocument } from '../schemas/subscription.schema';

@Injectable()
export class VideosService {
  constructor(
    @InjectModel(Video.name) private videoModel: Model<VideoDocument>,
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
    @InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>,
  ) {}

  async create(createVideoDto: CreateVideoDto, ownerId: string, videoFile: string, thumbnail: string) {
    const video = new this.videoModel({
      ...createVideoDto,
      owner: ownerId,
      videoFile,
      thumbnail,
    });
    return video.save();
  }

  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const videos = await this.videoModel
      .find({ isPublished: true })
      .populate('owner', 'username fullname avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await this.videoModel.countDocuments({ isPublished: true });
    return { videos, total, page, limit };
  }

  async findById(id: string) {
    const video = await this.videoModel
      .findById(id)
      .populate('owner', 'username fullname avatar subscribersCount');
    
    if (!video) {
      throw new NotFoundException('Video not found');
    }
    return video;
  }

  async findRelated(videoId: string, limit: number = 10) {
    const video = await this.findById(videoId);
    const relatedVideos = await this.videoModel
      .find({
        _id: { $ne: videoId },
        owner: { $ne: video.owner },
        isPublished: true,
        $or: [
          { tags: { $in: video.tags } },
          { title: { $regex: video.title.split(' ')[0], $options: 'i' } },
        ],
      })
      .populate('owner', 'username fullname avatar')
      .limit(limit)
      .sort({ views: -1 });

    return relatedVideos;
  }

  async search(query: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const videos = await this.videoModel
      .find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } },
        ],
        isPublished: true,
      })
      .populate('owner', 'username fullname avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await this.videoModel.countDocuments({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } },
      ],
      isPublished: true,
    });

    return { videos, total, page, limit };
  }

  async getSubscribedVideos(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const subscriptions = await this.subscriptionModel.find({ subscriber: userId });
    const channelIds = subscriptions.map((sub) => sub.channel);

    if (channelIds.length === 0) {
      return { videos: [], total: 0, page, limit };
    }

    const videos = await this.videoModel
      .find({ owner: { $in: channelIds }, isPublished: true })
      .populate('owner', 'username fullname avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await this.videoModel.countDocuments({
      owner: { $in: channelIds },
      isPublished: true,
    });

    return { videos, total, page, limit };
  }

  async incrementViewCount(id: string) {
    const video = await this.videoModel.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true },
    );
    if (!video) {
      throw new NotFoundException('Video not found');
    }
    return video;
  }

  async delete(id: string, userId: string) {
    const video = await this.findById(id);
    if (video.owner.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own videos');
    }
    await this.videoModel.findByIdAndDelete(id);
    await this.likeModel.deleteMany({ video: id });
  }
}

