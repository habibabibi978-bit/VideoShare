import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaylistsService } from './playlists.service';
import { PlaylistsController } from './playlists.controller';
import { Playlist } from '../entities/playlist.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Playlist, User])],
  controllers: [PlaylistsController],
  providers: [PlaylistsService],
})
export class PlaylistsModule {}


