import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Subscriptions')
@Controller('subscription')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post('toggle/:channelId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle subscription' })
  async toggle(@Param('channelId') channelId: string, @Req() req: any) {
    return this.subscriptionsService.toggle(channelId, req.user.userId);
  }

  @Get('subscribed')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get subscribed channels' })
  async getSubscribedChannels(@Req() req: any) {
    return { data: await this.subscriptionsService.getSubscribedChannels(req.user.userId) };
  }

  @Get('subscribers/:channelId')
  @ApiOperation({ summary: 'Get channel subscribers' })
  async getSubscribers(@Param('channelId') channelId: string) {
    return { data: await this.subscriptionsService.getSubscribers(channelId) };
  }
}


