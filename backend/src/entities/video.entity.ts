import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from './user.entity';
import { Playlist } from './playlist.entity';

@Entity('videos')
export class Video {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  ownerId: string;

  @ManyToOne(() => User, (user) => user.videos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column()
  videoFile: string;

  @Column()
  thumbnail: string;

  @Column({ default: 0 })
  views: number;

  @Column({ default: 0 })
  duration: number;

  @Column({ default: true })
  isPublished: boolean;

  @Column('text', { array: true, default: [] })
  tags: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Playlist, (playlist) => playlist.videos)
  playlists: Playlist[];
}

