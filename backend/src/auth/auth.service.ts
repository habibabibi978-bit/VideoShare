import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  private emailTransporter;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    // Initialize email transporter only if email configuration is provided
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      this.emailTransporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    }
  }

  async register(registerDto: RegisterDto) {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    const user = await this.usersService.create({
      ...registerDto,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    // Send verification email
    await this.sendVerificationEmail(user.email, user._id.toString(), verificationToken);

    const tokens = await this.generateTokens(user._id.toString(), user.email);
    return {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullname: user.fullname,
        avatar: user.avatar,
      },
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user._id.toString(), user.email);
    return {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullname: user.fullname,
        avatar: user.avatar,
      },
      ...tokens,
    };
  }

  async googleLogin(googleUser: any) {
    let user = await this.usersService.findByGoogleId(googleUser.googleId);

    if (!user) {
      user = await this.usersService.findByEmail(googleUser.email);
      if (user) {
        user.googleId = googleUser.googleId;
        if (!user.avatar) user.avatar = googleUser.avatar;
        await user.save();
      } else {
        const username = googleUser.email.split('@')[0] + Math.floor(Math.random() * 1000);
        user = await this.usersService.create({
          email: googleUser.email,
          username,
          fullname: googleUser.fullname,
          avatar: googleUser.avatar,
          googleId: googleUser.googleId,
          isEmailVerified: true,
        });
      }
    }

    const tokens = await this.generateTokens(user._id.toString(), user.email);
    return {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullname: user.fullname,
        avatar: user.avatar,
      },
      ...tokens,
    };
  }

  async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessTokenSecret = this.configService.get<string>('jwt.secret') || 'default-secret';
    const accessTokenExpires = this.configService.get<string>('jwt.expiresIn') || '7d';
    const refreshTokenSecret = this.configService.get<string>('jwt.refreshSecret') || 'default-refresh-secret';
    const refreshTokenExpires = this.configService.get<string>('jwt.refreshExpiresIn') || '30d';

    const accessToken = this.jwtService.sign(payload, {
      secret: accessTokenSecret,
      expiresIn: accessTokenExpires,
    } as any);

    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshTokenSecret,
      expiresIn: refreshTokenExpires,
    } as any);

    return { accessToken, refreshToken };
  }

  async sendVerificationEmail(email: string, userId: string, token: string) {
    // Skip email sending if email transporter is not configured
    if (!this.emailTransporter) {
      console.warn('Email configuration not found. Skipping verification email.');
      console.log(`Verification URL for ${email}: ${process.env.APP_URL || 'http://localhost:3000'}/api/users/verify/${userId}/${token}`);
      return;
    }

    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const verificationUrl = `${appUrl}/api/users/verify/${userId}/${token}`;

    try {
      await this.emailTransporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@tech-app.com',
        to: email,
        subject: 'Verify your email',
        html: `
          <h2>Please verify your email</h2>
          <p>Click the link below to verify your email address:</p>
          <a href="${verificationUrl}">${verificationUrl}</a>
        `,
      });
    } catch (error) {
      console.error('Failed to send verification email:', error);
      console.log(`Verification URL for ${email}: ${verificationUrl}`);
    }
  }
}


