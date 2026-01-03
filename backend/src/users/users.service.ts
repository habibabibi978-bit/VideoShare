import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Video } from '../entities/video.entity';
import { Subscription } from '../entities/subscription.entity';
import { WatchHistory } from '../entities/watch-history.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(WatchHistory)
    private watchHistoryRepository: Repository<WatchHistory>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'username', 'email', 'fullname', 'avatar', 'coverImage', 'about', 'isEmailVerified', 'googleId', 'subscribersCount', 'videosCount', 'totalViews', 'createdAt', 'updatedAt'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username: username.toLowerCase() },
    });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { googleId },
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    if (!userData.email || !userData.username) {
      throw new BadRequestException('Email and username are required');
    }

    const existingUser = await this.userRepository.findOne({
      where: [
        { email: userData.email.toLowerCase() },
        { username: userData.username.toLowerCase() },
      ],
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    const user = this.userRepository.create({
      ...userData,
      email: userData.email.toLowerCase(),
      username: userData.username.toLowerCase(),
    });
    return this.userRepository.save(user);
  }

  async update(id: string, updateData: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.findByEmail(updateData.email);
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
      user.email = updateData.email.toLowerCase();
      user.isEmailVerified = false;
    }

    if (updateData.fullname) user.fullname = updateData.fullname;
    if (updateData.about !== undefined) user.about = updateData.about;

    return this.userRepository.save(user);
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user || !user.password) {
      throw new BadRequestException('Invalid user or password not set');
    }

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid old password');
    }

    user.password = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.userRepository.save(user);
  }

  async updateGoogleId(id: string, googleId: string, avatar?: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.googleId = googleId;
    if (avatar && !user.avatar) {
      user.avatar = avatar;
    }
    return this.userRepository.save(user);
  }

  async updateAvatar(id: string, avatarUrl: string): Promise<User> {
    const user = await this.findById(id);
    user.avatar = avatarUrl;
    return this.userRepository.save(user);
  }

  async updateCoverImage(id: string, coverImageUrl: string): Promise<User> {
    const user = await this.findById(id);
    user.coverImage = coverImageUrl;
    return this.userRepository.save(user);
  }

  async getProfile(username: string, currentUserId?: string) {
    const user = await this.userRepository.findOne({
      where: { username: username.toLowerCase() },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const videos = await this.videoRepository.find({
      where: { ownerId: user.id, isPublished: true },
    });
    const subscribersCount = await this.subscriptionRepository.count({
      where: { channelId: user.id },
    });

    let isSubscribed = false;
    if (currentUserId) {
      const subscription = await this.subscriptionRepository.findOne({
        where: {
          subscriberId: currentUserId,
          channelId: user.id,
        },
      });
      isSubscribed = !!subscription;
    }

    return {
      ...user,
      subscribersCount,
      isSubscribed,
      videosCount: videos.length,
    };
  }

  async getUserVideos(username: string) {
    const user = await this.userRepository.findOne({
      where: { username: username.toLowerCase() },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const videos = await this.videoRepository.find({
      where: { ownerId: user.id, isPublished: true },
      relations: ['owner'],
      order: { createdAt: 'DESC' },
    });

    return videos;
  }

  async getWatchHistory(userId: string) {
    const history = await this.watchHistoryRepository.find({
      where: { userId },
      relations: ['video', 'video.owner'],
      order: { createdAt: 'DESC' },
      take: 50,
    });

    return history.map((item) => item.video);
  }

  async updateWatchHistory(userId: string, videoId: string): Promise<void> {
    const existing = await this.watchHistoryRepository.findOne({
      where: { userId, videoId },
    });

    if (!existing) {
      const watchHistory = this.watchHistoryRepository.create({
        userId,
        videoId,
      });
      await this.watchHistoryRepository.save(watchHistory);
    }
  }

  async deleteWatchHistory(userId: string, videoId?: string): Promise<void> {
    if (videoId) {
      await this.watchHistoryRepository.delete({ userId, videoId });
    } else {
      await this.watchHistoryRepository.delete({ userId });
    }
  }

  async deleteAccount(id: string): Promise<void> {
    await this.userRepository.delete(id);
    await this.videoRepository.delete({ ownerId: id });
    await this.subscriptionRepository.delete([
      { subscriberId: id },
      { channelId: id },
    ]);
    await this.watchHistoryRepository.delete({ userId: id });
  }

  async deleteUserByEmail(email: string): Promise<{ success: boolean; message: string }> {
    const user = await this.findByEmail(email);
    if (!user) {
      return { success: false, message: `User with email ${email} not found.` };
    }

    try {
      await this.deleteAccount(user.id);
      return { success: true, message: `Successfully deleted user ${email} and all related data.` };
    } catch (error) {
      return { success: false, message: `Error deleting user: ${error.message}` };
    }
  }

  async verifyEmail(userId: string, token: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (
      user.emailVerificationToken !== token ||
      !user.emailVerificationExpires ||
      user.emailVerificationExpires < new Date()
    ) {
      throw new BadRequestException('Invalid or expired token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await this.userRepository.save(user);
  }
}
