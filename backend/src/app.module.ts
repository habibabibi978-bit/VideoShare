import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VideosModule } from './videos/videos.module';
import { CommentsModule } from './comments/comments.module';
import { LikesModule } from './likes/likes.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PlaylistsModule } from './playlists/playlists.module';
import databaseConfig from './config/database.config';
import { User } from './entities/user.entity';
import { Video } from './entities/video.entity';
import { Comment } from './entities/comment.entity';
import { Like } from './entities/like.entity';
import { Subscription } from './entities/subscription.entity';
import { WatchHistory } from './entities/watch-history.entity';
import { Notification } from './entities/notification.entity';
import { Playlist } from './entities/playlist.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        synchronize: configService.get<boolean>('database.synchronize'),
        logging: configService.get<boolean>('database.logging'),
        entities: [User, Video, Comment, Like, Subscription, WatchHistory, Notification, Playlist],
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    VideosModule,
    CommentsModule,
    LikesModule,
    SubscriptionsModule,
    NotificationsModule,
    PlaylistsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
