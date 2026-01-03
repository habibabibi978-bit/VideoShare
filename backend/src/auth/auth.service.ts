import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { User } from '../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  private emailTransporter;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
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
    await this.sendVerificationEmail(user.email, user.id, verificationToken);

    // Don't return tokens - user must verify email before logging in
    return {
      message: 'Registration successful. Please check your email to verify your account before logging in.',
      user: {
        _id: user.id,
        username: user.username,
        email: user.email,
        fullname: user.fullname,
        avatar: user.avatar,
      },
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

    // Check if email is verified - this check happens AFTER password validation
    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email before logging in. Check your inbox for the verification link.');
    }

    const tokens = await this.generateTokens(user.id, user.email);
    return {
      user: {
        _id: user.id,
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
        user = await this.usersService.updateGoogleId(user.id, googleUser.googleId, googleUser.avatar);
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

    const tokens = await this.generateTokens(user.id, user.email);
    return {
      user: {
        _id: user.id,
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
    // Use frontend URL for verification link
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationUrl = `${frontendUrl}/user/verify/${userId}/${token}`;

    // Skip email sending if email transporter is not configured
    if (!this.emailTransporter) {
      console.warn('Email configuration not found. Skipping verification email.');
      console.log(`Verification URL for ${email}: ${verificationUrl}`);
      return;
    }

    try {
      await this.emailTransporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@tech-app.com',
        to: email,
        subject: 'Verify your email',
        html: `
          <h2>Please verify your email</h2>
          <p>Click the link below to verify your email address:</p>
          <a href="${verificationUrl}">${verificationUrl}</a>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        `,
      });
    } catch (error) {
      console.error('Failed to send verification email:', error);
      console.log(`Verification URL for ${email}: ${verificationUrl}`);
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);
    
    // Don't reveal if user exists or not for security
    if (!user) {
      return { message: 'If an account with that email exists, a password reset link has been sent.' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // Token expires in 1 hour

    // Save reset token to user using repository directly
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await this.userRepository.save(user);

    // Send reset email
    await this.sendPasswordResetEmail(user.email, user.id, resetToken);

    return { message: 'If an account with that email exists, a password reset link has been sent.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.userRepository.findOne({
      where: { id: resetPasswordDto.userId },
    });
    
    if (!user) {
      throw new BadRequestException('Invalid reset token');
    }

    if (!user.passwordResetToken || user.passwordResetToken !== resetPasswordDto.token) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Reset token has expired. Please request a new one.');
    }

    // Reset password
    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);
    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await this.userRepository.save(user);

    return { message: 'Password has been reset successfully' };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists for security
      return { message: 'If an account with that email exists and is not verified, a verification email has been sent.' };
    }

    // If email is already verified, don't send another email
    if (user.isEmailVerified) {
      return { message: 'Email is already verified. You can log in now.' };
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    // Update user with new token
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await this.userRepository.save(user);

    // Send verification email
    await this.sendVerificationEmail(user.email, user.id, verificationToken);

    return { message: 'Verification email has been sent. Please check your inbox.' };
  }

  async sendPasswordResetEmail(email: string, userId: string, token: string) {
    // Skip email sending if email transporter is not configured
    if (!this.emailTransporter) {
      console.warn('Email configuration not found. Skipping password reset email.');
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      console.log(`Password reset URL for ${email}: ${frontendUrl}/reset-password/${userId}/${token}`);
      return;
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${userId}/${token}`;

    try {
      await this.emailTransporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@tech-app.com',
        to: email,
        subject: 'Reset your password',
        html: `
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password. Click the link below to reset it:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      });
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      console.log(`Password reset URL for ${email}: ${frontendUrl}/reset-password/${userId}/${token}`);
    }
  }
}


