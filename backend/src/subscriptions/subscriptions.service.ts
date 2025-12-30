import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription, SubscriptionDocument } from '../schemas/subscription.schema';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async toggle(channelId: string, subscriberId: string) {
    if (channelId === subscriberId) {
      throw new BadRequestException('Cannot subscribe to yourself');
    }

    const existingSubscription = await this.subscriptionModel.findOne({
      subscriber: subscriberId,
      channel: channelId,
    });

    if (existingSubscription) {
      await this.subscriptionModel.findByIdAndDelete(existingSubscription._id);
      await this.userModel.findByIdAndUpdate(channelId, { $inc: { subscribersCount: -1 } });
      return { subscribed: false };
    } else {
      await this.subscriptionModel.create({
        subscriber: subscriberId,
        channel: channelId,
      });
      await this.userModel.findByIdAndUpdate(channelId, { $inc: { subscribersCount: 1 } });
      return { subscribed: true };
    }
  }

  async getSubscribedChannels(userId: string) {
    const subscriptions = await this.subscriptionModel
      .find({ subscriber: userId })
      .populate('channel', 'username fullname avatar subscribersCount videosCount')
      .sort({ createdAt: -1 });

    return subscriptions.map((sub) => sub.channel);
  }

  async getSubscribers(channelId: string) {
    const subscriptions = await this.subscriptionModel
      .find({ channel: channelId })
      .populate('subscriber', 'username fullname avatar')
      .sort({ createdAt: -1 });

    return subscriptions.map((sub) => sub.subscriber);
  }

  async getSubscribedVideos(userId: string) {
    // This method is not used - videos are fetched through VideosService.getSubscribedVideos
    // Keeping for interface compatibility
    return [];
  }
}


