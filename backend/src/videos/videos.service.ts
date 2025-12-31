import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like as TypeOrmLike, In, Not } from 'typeorm';
import { Video } from '../entities/video.entity';
import { CreateVideoDto } from './dto/create-video.dto';
import { Like } from '../entities/like.entity';
import { Subscription } from '../entities/subscription.entity';

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
  ) {}

  async create(createVideoDto: CreateVideoDto, ownerId: string, videoFile: string, thumbnail: string) {
    const video = this.videoRepository.create({
      ...createVideoDto,
      ownerId,
      videoFile,
      thumbnail,
    });
    return this.videoRepository.save(video);
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

    return { videos, total, page, limit };
  }

  async findById(id: string) {
    const video = await this.videoRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
    
    if (!video) {
      throw new NotFoundException('Video not found');
    }
    return video;
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
