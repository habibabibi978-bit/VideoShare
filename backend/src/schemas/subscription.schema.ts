import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';

export type SubscriptionDocument = Subscription & Document;

@Schema({ timestamps: true })
export class Subscription {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  subscriber: Types.ObjectId | User;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  channel: Types.ObjectId | User;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
SubscriptionSchema.index({ subscriber: 1, channel: 1 }, { unique: true });


