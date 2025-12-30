import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';
import { Video } from './video.schema';

export type PlaylistDocument = Playlist & Document;

@Schema({ timestamps: true })
export class Playlist {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId | User;

  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  description: string;

  @Prop([{ type: Types.ObjectId, ref: 'Video' }])
  videos: Types.ObjectId[] | Video[];
}

export const PlaylistSchema = SchemaFactory.createForClass(Playlist);


