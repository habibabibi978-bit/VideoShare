import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';

@Entity('subscriptions')
@Unique(['subscriberId', 'channelId'])
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  subscriberId: string;

  @ManyToOne(() => User, (user) => user.subscriptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subscriberId' })
  subscriber: User;

  @Column({ type: 'uuid' })
  channelId: string;

  @ManyToOne(() => User, (user) => user.subscribers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channelId' })
  channel: User;

  @Column({ type: 'boolean', default: true })
  notificationsEnabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

