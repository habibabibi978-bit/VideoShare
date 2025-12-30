import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Video, VideoDocument } from '../schemas/video.schema';
import { Subscription, SubscriptionDocument } from '../schemas/subscription.schema';
import { WatchHistory, WatchHistoryDocument } from '../schemas/watch-history.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Video.name) private videoModel: Model<VideoDocument>,
    @InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(WatchHistory.name) private watchHistoryModel: Model<WatchHistoryDocument>,
  ) {}

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).select('-password');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() });
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username: username.toLowerCase() });
  }

  async findByGoogleId(googleId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ googleId });
  }

  async create(userData: Partial<User>): Promise<UserDocument> {
    if (!userData.email || !userData.username) {
      throw new BadRequestException('Email and username are required');
    }

    const existingUser = await this.userModel.findOne({
      $or: [
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

    const user = new this.userModel({
      ...userData,
      email: userData.email.toLowerCase(),
      username: userData.username.toLowerCase(),
    });
    return user.save();
  }

  async update(id: string, updateData: UpdateUserDto): Promise<UserDocument> {
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

    return user.save();
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.userModel.findById(id);
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
    await user.save();
  }

  async updateAvatar(id: string, avatarUrl: string): Promise<UserDocument> {
    const user = await this.findById(id);
    user.avatar = avatarUrl;
    return user.save();
  }

  async updateCoverImage(id: string, coverImageUrl: string): Promise<UserDocument> {
    const user = await this.findById(id);
    user.coverImage = coverImageUrl;
    return user.save();
  }

  async getProfile(username: string, currentUserId?: string) {
    const user = await this.userModel.findOne({ username: username.toLowerCase() });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const videos = await this.videoModel.find({ owner: user._id, isPublished: true });
    const subscribersCount = await this.subscriptionModel.countDocuments({
      channel: user._id,
    });

    let isSubscribed = false;
    if (currentUserId) {
      const subscription = await this.subscriptionModel.findOne({
        subscriber: currentUserId,
        channel: user._id,
      });
      isSubscribed = !!subscription;
    }

    return {
      ...user.toObject(),
      subscribersCount,
      isSubscribed,
      videosCount: videos.length,
    };
  }

  async getUserVideos(username: string) {
    const user = await this.userModel.findOne({ username: username.toLowerCase() });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const videos = await this.videoModel
      .find({ owner: user._id, isPublished: true })
      .populate('owner', 'username fullname avatar')
      .sort({ createdAt: -1 });

    return videos;
  }

  async getWatchHistory(userId: string) {
    const history = await this.watchHistoryModel
      .find({ user: userId })
      .populate({
        path: 'video',
        populate: { path: 'owner', select: 'username fullname avatar' },
      })
      .sort({ createdAt: -1 })
      .limit(50);

    return history.map((item) => item.video);
  }

  async updateWatchHistory(userId: string, videoId: string): Promise<void> {
    await this.watchHistoryModel.findOneAndUpdate(
      { user: userId, video: videoId },
      { user: userId, video: videoId },
      { upsert: true, new: true },
    );
  }

  async deleteWatchHistory(userId: string, videoId?: string): Promise<void> {
    if (videoId) {
      await this.watchHistoryModel.deleteOne({ user: userId, video: videoId });
    } else {
      await this.watchHistoryModel.deleteMany({ user: userId });
    }
  }

  async deleteAccount(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id);
    await this.videoModel.deleteMany({ owner: id });
    await this.subscriptionModel.deleteMany({ $or: [{ subscriber: id }, { channel: id }] });
    await this.watchHistoryModel.deleteMany({ user: id });
  }

  async verifyEmail(userId: string, token: string): Promise<void> {
    const user = await this.userModel.findById(userId);
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
    user.emailVerificationToken = null as any;
    user.emailVerificationExpires = null as any;
    await user.save();
  }
}


