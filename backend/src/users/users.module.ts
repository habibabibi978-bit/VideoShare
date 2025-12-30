import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from '../schemas/user.schema';
import { Video, VideoSchema } from '../schemas/video.schema';
import { Subscription, SubscriptionSchema } from '../schemas/subscription.schema';
import { WatchHistory, WatchHistorySchema } from '../schemas/watch-history.schema';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Video.name, schema: VideoSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: WatchHistory.name, schema: WatchHistorySchema },
    ]),
    CloudinaryModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

