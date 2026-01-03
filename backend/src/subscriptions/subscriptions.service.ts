import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../entities/subscription.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async toggle(channelId: string, subscriberId: string) {
    if (channelId === subscriberId) {
      throw new BadRequestException('Cannot subscribe to yourself');
    }

    const existingSubscription = await this.subscriptionRepository.findOne({
      where: { subscriberId, channelId },
    });

    if (existingSubscription) {
      await this.subscriptionRepository.delete(existingSubscription.id);
      // Update subscribers count
      const channel = await this.userRepository.findOne({ where: { id: channelId } });
      if (channel) {
        channel.subscribersCount = Math.max(0, channel.subscribersCount - 1);
        await this.userRepository.save(channel);
      }
      return { subscribed: false };
    } else {
      const subscription = this.subscriptionRepository.create({
        subscriberId,
        channelId,
        notificationsEnabled: true, // Default to enabled when subscribing
      });
      await this.subscriptionRepository.save(subscription);
      // Update subscribers count
      const channel = await this.userRepository.findOne({ where: { id: channelId } });
      if (channel) {
        channel.subscribersCount = (channel.subscribersCount || 0) + 1;
        await this.userRepository.save(channel);
      }
      return { subscribed: true, notificationsEnabled: true };
    }
  }

  async toggleNotifications(channelId: string, subscriberId: string) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { subscriberId, channelId },
    });

    if (!subscription) {
      throw new BadRequestException('Subscription not found');
    }

    subscription.notificationsEnabled = !subscription.notificationsEnabled;
    await this.subscriptionRepository.save(subscription);
    return { notificationsEnabled: subscription.notificationsEnabled };
  }

  async getSubscriptionStatus(channelId: string, subscriberId: string) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { subscriberId, channelId },
    });

    if (!subscription) {
      return { subscribed: false, notificationsEnabled: false };
    }

    return {
      subscribed: true,
      notificationsEnabled: subscription.notificationsEnabled,
    };
  }

  async getSubscribersWithNotifications(channelId: string) {
    const subscriptions = await this.subscriptionRepository.find({
      where: { channelId, notificationsEnabled: true },
      relations: ['subscriber'],
    });

    return subscriptions.map((sub) => sub.subscriber);
  }

  async getSubscribedChannels(userId: string) {
    const subscriptions = await this.subscriptionRepository.find({
      where: { subscriberId: userId },
      relations: ['channel'],
      order: { createdAt: 'DESC' },
    });

    return subscriptions.map((sub) => ({
      channel: sub.channel,
      notificationsEnabled: sub.notificationsEnabled,
    }));
  }

  async getSubscribers(channelId: string) {
    const subscriptions = await this.subscriptionRepository.find({
      where: { channelId },
      relations: ['subscriber'],
      order: { createdAt: 'DESC' },
    });

    return subscriptions.map((sub) => sub.subscriber);
  }

  async getSubscribedVideos(userId: string) {
    // This method is not used - videos are fetched through VideosService.getSubscribedVideos
    // Keeping for interface compatibility
    return [];
  }
}


