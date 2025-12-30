import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';

export type VideoDocument = Video & Document;

@Schema({ timestamps: true })
export class Video {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId | User;

  @Prop({ required: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ required: true })
  videoFile: string;

  @Prop({ required: true })
  thumbnail: string;

  @Prop({ default: 0 })
  views: number;

  @Prop({ default: 0 })
  duration: number;

  @Prop({ default: true })
  isPublished: boolean;

  @Prop([{ type: String }])
  tags: string[];
}

export const VideoSchema = SchemaFactory.createForClass(Video);


