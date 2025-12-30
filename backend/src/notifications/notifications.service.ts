import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from '../schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
  ) {}

  async findAll(userId: string) {
    return this.notificationModel
      .find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50);
  }

  async markAsRead(userId: string) {
    await this.notificationModel.updateMany(
      { user: userId, isRead: false },
      { isRead: true },
    );
  }

  async create(userId: string, message: string, type: string, link?: string) {
    return this.notificationModel.create({
      user: userId,
      message,
      type,
      link,
    });
  }
}


