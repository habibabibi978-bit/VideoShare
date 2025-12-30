import {
  Controller,
  Get,
  Put,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all notifications' })
  async findAll(@Req() req: any) {
    return { data: await this.notificationsService.findAll(req.user.userId) };
  }

  @Put('mark-read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark notifications as read' })
  async markAsRead(@Req() req: any) {
    await this.notificationsService.markAsRead(req.user.userId);
    return { message: 'Notifications marked as read' };
  }
}


