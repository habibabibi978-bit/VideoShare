import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  username: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: false })
  fullname: string;

  @Prop()
  password: string;

  @Prop()
  avatar: string;

  @Prop()
  coverImage: string;

  @Prop({ default: '' })
  about: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop()
  emailVerificationToken: string;

  @Prop()
  emailVerificationExpires: Date;

  @Prop()
  googleId: string;

  @Prop({ default: 0 })
  subscribersCount: number;

  @Prop({ default: 0 })
  videosCount: number;

  @Prop({ default: 0 })
  totalViews: number;
}

export const UserSchema = SchemaFactory.createForClass(User);


