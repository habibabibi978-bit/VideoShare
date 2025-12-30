import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private isConfigured: boolean;
  private configService: ConfigService;

  constructor(configService: ConfigService) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL');
    
    const isConfigured = !!(clientID && clientSecret && callbackURL);
    
    // Make Google OAuth optional - only configure if credentials are provided
    if (!isConfigured) {
      // Use dummy values to prevent Passport from throwing errors
      // The strategy won't work, but the app will start
      super({
        clientID: 'dummy-client-id',
        clientSecret: 'dummy-client-secret',
        callbackURL: 'http://localhost:3000/api/auth/google/callback',
        scope: ['email', 'profile'],
      });
      this.configService = configService;
      this.isConfigured = false;
      console.warn('Google OAuth credentials not configured. Google sign-in will not work.');
    } else {
      super({
        clientID: clientID!,
        clientSecret: clientSecret!,
        callbackURL: callbackURL!,
        scope: ['email', 'profile'],
      });
      this.configService = configService;
      this.isConfigured = true;
    }
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    if (!this.isConfigured) {
      return done(new Error('Google OAuth is not configured'), undefined);
    }

    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      fullname: `${name.givenName} ${name.familyName}`,
      avatar: photos[0].value,
      googleId: profile.id,
    };
    done(null, user);
  }
}


