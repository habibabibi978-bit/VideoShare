import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';
import { Video } from './video.schema';

export type LikeDocument = Like & Document;

@Schema({ timestamps: true })
export class Like {
  @Prop({ type: Types.ObjectId, ref: 'Video', required: true })
  video: Types.ObjectId | Video;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId | User;

  @Prop({ enum: ['like', 'dislike'], required: true })
  type: string;
}

export const LikeSchema = SchemaFactory.createForClass(Like);
LikeSchema.index({ video: 1, owner: 1 }, { unique: true });


