import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Video } from './video.entity';
import { Comment } from './comment.entity';
import { Like } from './like.entity';
import { Subscription } from './subscription.entity';
import { WatchHistory } from './watch-history.entity';
import { Notification } from './notification.entity';
import { Playlist } from './playlist.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  username: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ nullable: true, length: 255 })
  fullname: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  coverImage: string;

  @Column({ default: '' })
  about: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true, type: 'varchar' })
  emailVerificationToken: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  emailVerificationExpires: Date | null;

  @Column({ nullable: true, unique: true })
  googleId: string;

  @Column({ default: 0 })
  subscribersCount: number;

  @Column({ default: 0 })
  videosCount: number;

  @Column({ default: 0 })
  totalViews: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Video, (video) => video.owner)
  videos: Video[];

  @OneToMany(() => Comment, (comment) => comment.owner)
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.owner)
  likes: Like[];

  @OneToMany(() => Subscription, (subscription) => subscription.subscriber)
  subscriptions: Subscription[];

  @OneToMany(() => Subscription, (subscription) => subscription.channel)
  subscribers: Subscription[];

  @OneToMany(() => WatchHistory, (watchHistory) => watchHistory.user)
  watchHistory: WatchHistory[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => Playlist, (playlist) => playlist.owner)
  playlists: Playlist[];
}

