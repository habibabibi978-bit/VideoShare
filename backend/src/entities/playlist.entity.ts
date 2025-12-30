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
import { Video } from './video.entity';

@Entity('playlists')
export class Playlist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  ownerId: string;

  @ManyToOne(() => User, (user) => user.playlists, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', default: '' })
  description: string;

  @ManyToMany(() => Video, (video) => video.playlists)
  @JoinTable({
    name: 'playlist_videos',
    joinColumn: { name: 'playlistId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'videoId', referencedColumnName: 'id' },
  })
  videos: Video[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

