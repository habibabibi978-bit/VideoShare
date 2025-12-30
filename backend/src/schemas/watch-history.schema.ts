import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';
import { Video } from './video.schema';

export type WatchHistoryDocument = WatchHistory & Document;

@Schema({ timestamps: true })
export class WatchHistory {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId | User;

  @Prop({ type: Types.ObjectId, ref: 'Video', required: true })
  video: Types.ObjectId | Video;
}

export const WatchHistorySchema = SchemaFactory.createForClass(WatchHistory);
WatchHistorySchema.index({ user: 1, video: 1 }, { unique: true });


