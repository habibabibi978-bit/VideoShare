import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like as TypeOrmLike, In, Not } from 'typeorm';
import { Video } from '../entities/video.entity';
import { CreateVideoDto } from './dto/create-video.dto';
import { Like, LikeType } from '../entities/like.entity';
import { Subscription } from '../entities/subscription.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { User } from '../entities/user.entity';

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private notificationsService: NotificationsService,
  ) {}

  async create(createVideoDto: CreateVideoDto, ownerId: string, videoFile: string, thumbnail: string) {
    const video = this.videoRepository.create({
      ...createVideoDto,
      ownerId,
      videoFile,
      thumbnail,
    });
    const savedVideo = await this.videoRepository.save(video);

    // Send notifications to subscribers with notifications enabled
    if (savedVideo.isPublished) {
      try {
        const subscriptions = await this.subscriptionRepository.find({
          where: { channelId: ownerId, notificationsEnabled: true },
          relations: ['subscriber'],
        });

        // Get owner info for notification message
        const owner = await this.userRepository.findOne({ where: { id: ownerId } });
        const ownerName = owner?.fullname || owner?.username || 'A channel';
        const videoLink = `/videos/${savedVideo.id}`;

        // Create notifications for each subscriber
        await Promise.all(
          subscriptions.map((subscription) =>
            this.notificationsService.create(
              subscription.subscriberId,
              `${ownerName} uploaded a new video: ${savedVideo.title}`,
              'video_upload',
              videoLink,
            ),
          ),
        );
      } catch (error) {
        // Log error but don't fail video creation if notifications fail
        console.error('Error sending notifications:', error);
      }
    }

    return savedVideo;
  }

  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [videos, total] = await this.videoRepository.findAndCount({
      where: { isPublished: true },
      relations: ['owner'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    // Add likes and dislikes counts to each video
    const videosWithCounts = await Promise.all(
      videos.map(async (video) => {
        const likesCount = await this.likeRepository.count({
          where: { videoId: video.id, type: LikeType.LIKE },
        });
        const dislikesCount = await this.likeRepository.count({
          where: { videoId: video.id, type: LikeType.DISLIKE },
        });
        return {
          ...video,
          likes: likesCount,
          dislikes: dislikesCount,
        };
      })
    );

    return { videos: videosWithCounts, total, page, limit };
  }

  async findById(id: string) {
    const video = await this.videoRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
    
    if (!video) {
      throw new NotFoundException('Video not found');
    }

    // Calculate likes and dislikes counts
    const likesCount = await this.likeRepository.count({
      where: { videoId: id, type: LikeType.LIKE },
    });

    const dislikesCount = await this.likeRepository.count({
      where: { videoId: id, type: LikeType.DISLIKE },
    });

    // Add likes and dislikes to video object
    return {
      ...video,
      likes: likesCount,
      dislikes: dislikesCount,
    };
  }

  async findRelated(videoId: string, limit: number = 10) {
    const video = await this.findById(videoId);
    const queryBuilder = this.videoRepository.createQueryBuilder('video')
      .leftJoinAndSelect('video.owner', 'owner')
      .where('video.id != :videoId', { videoId })
      .andWhere('video.ownerId != :ownerId', { ownerId: video.ownerId })
      .andWhere('video.isPublished = :isPublished', { isPublished: true });

    if (video.tags && video.tags.length > 0) {
      queryBuilder.andWhere('video.tags && :tags', { tags: video.tags });
    } else {
      const firstWord = video.title.split(' ')[0];
      queryBuilder.andWhere('video.title ILIKE :title', { title: `%${firstWord}%` });
    }

    const relatedVideos = await queryBuilder
      .orderBy('video.views', 'DESC')
      .take(limit)
      .getMany();

    return relatedVideos;
  }

  async search(query: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const searchPattern = `%${query}%`;

    const queryBuilder = this.videoRepository.createQueryBuilder('video')
      .leftJoinAndSelect('video.owner', 'owner')
      .where('video.isPublished = :isPublished', { isPublished: true })
      .andWhere(
        '(video.title ILIKE :query OR video.description ILIKE :query OR video.tags::text ILIKE :query)',
        { query: searchPattern }
      )
      .orderBy('video.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [videos, total] = await queryBuilder.getManyAndCount();

    return { videos, total, page, limit };
  }

  async getSubscribedVideos(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const subscriptions = await this.subscriptionRepository.find({
      where: { subscriberId: userId },
    });
    const channelIds = subscriptions.map((sub) => sub.channelId);

    if (channelIds.length === 0) {
      return { videos: [], total: 0, page, limit };
    }

    const [videos, total] = await this.videoRepository.findAndCount({
      where: { ownerId: In(channelIds), isPublished: true },
      relations: ['owner'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { videos, total, page, limit };
  }

  async incrementViewCount(id: string) {
    await this.videoRepository.increment({ id }, 'views', 1);
    const video = await this.videoRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!video) {
      throw new NotFoundException('Video not found');
    }
    return video;
  }

  async delete(id: string, userId: string) {
    const video = await this.findById(id);
    if (video.ownerId !== userId) {
      throw new ForbiddenException('You can only delete your own videos');
    }
    await this.videoRepository.delete(id);
    await this.likeRepository.delete({ videoId: id });
  }
}
