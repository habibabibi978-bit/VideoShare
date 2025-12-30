import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  UseGuards,
  Param,
  UseInterceptors,
  UploadedFile,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RegisterDto } from '../auth/dto/register.dto';
import { LoginDto } from '../auth/dto/login.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('current-user')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  async getCurrentUser(@Req() req: any) {
    return this.usersService.findById(req.user.userId);
  }

  @Get('c/:username')
  @ApiOperation({ summary: 'Get user profile by username' })
  async getProfile(@Param('username') username: string, @Req() req: any) {
    return this.usersService.getProfile(username, req.user?.userId);
  }

  @Get('c/:username/videos')
  @ApiOperation({ summary: 'Get user videos' })
  async getUserVideos(@Param('username') username: string) {
    return this.usersService.getUserVideos(username);
  }

  @Patch('update-account')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user account' })
  async updateAccount(@Req() req: any, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.userId, updateUserDto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password' })
  async changePassword(@Req() req: any, @Body() changePasswordDto: ChangePasswordDto) {
    await this.usersService.changePassword(req.user.userId, changePasswordDto);
    return { message: 'Password changed successfully' };
  }

  @Patch('avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({ summary: 'Update avatar' })
  async updateAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    const avatarUrl = await this.cloudinaryService.uploadImage(file, 'avatars');
    return this.usersService.updateAvatar(req.user.userId, avatarUrl);
  }

  @Patch('coverImage')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('coverImage'))
  @ApiOperation({ summary: 'Update cover image' })
  async updateCoverImage(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    const coverImageUrl = await this.cloudinaryService.uploadImage(file, 'covers');
    return this.usersService.updateCoverImage(req.user.userId, coverImageUrl);
  }

  @Get('watch-history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get watch history' })
  async getWatchHistory(@Req() req: any) {
    return this.usersService.getWatchHistory(req.user.userId);
  }

  @Post('update-watch-history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update watch history' })
  async updateWatchHistory(@Req() req: any, @Body() body: { videoId: string }) {
    await this.usersService.updateWatchHistory(req.user.userId, body.videoId);
    return { message: 'Watch history updated' };
  }

  @Delete('watch-history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete watch history' })
  async deleteWatchHistory(@Req() req: any, @Body() body?: { videoId?: string }) {
    await this.usersService.deleteWatchHistory(req.user.userId, body?.videoId);
    return { message: 'Watch history deleted' };
  }

  @Delete('delete-account')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete account' })
  async deleteAccount(@Req() req: any) {
    await this.usersService.deleteAccount(req.user.userId);
    return { message: 'Account deleted successfully' };
  }

  @Get('verify/:userId/:token')
  @ApiOperation({ summary: 'Verify email' })
  async verifyEmail(@Param('userId') userId: string, @Param('token') token: string) {
    await this.usersService.verifyEmail(userId, token);
    return { message: 'Email verified successfully' };
  }
}

