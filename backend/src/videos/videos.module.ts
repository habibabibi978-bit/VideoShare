import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { Video, VideoSchema } from '../schemas/video.schema';
import { Like, LikeSchema } from '../schemas/like.schema';
import { Subscription, SubscriptionSchema } from '../schemas/subscription.schema';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Video.name, schema: VideoSchema },
      { name: Like.name, schema: LikeSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),
    CloudinaryModule,
  ],
  controllers: [VideosController],
  providers: [VideosService],
  exports: [VideosService],
})
export class VideosModule {}

