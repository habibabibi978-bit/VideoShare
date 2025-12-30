import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PlaylistsService } from './playlists.service';

@ApiTags('Playlists')
@Controller('playlist')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Get(':username')
  @ApiOperation({ summary: 'Get user playlists' })
  async findByUsername(@Param('username') username: string) {
    return { data: await this.playlistsService.findByUsername(username) };
  }
}


