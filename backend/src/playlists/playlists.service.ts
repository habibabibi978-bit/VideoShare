import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Playlist } from '../entities/playlist.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class PlaylistsService {
  constructor(
    @InjectRepository(Playlist)
    private playlistRepository: Repository<Playlist>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findByUsername(username: string) {
    const user = await this.userRepository.findOne({
      where: { username: username.toLowerCase() },
    });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.playlistRepository.find({
      where: { ownerId: user.id },
      relations: ['videos', 'videos.owner'],
      order: { createdAt: 'DESC' },
    });
  }
}


