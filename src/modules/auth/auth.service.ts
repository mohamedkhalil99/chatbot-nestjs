import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/schemas/user.schema';
import * as bcrypt from 'bcrypt';

interface GoogleUser {
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
}
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
interface AuthResult extends AuthTokens {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async handleGoogleLogin(profile: GoogleUser): Promise<AuthResult> {
    // check if user exists
    let user = await this.userModel.findOne({ googleId: profile.googleId });
    if (!user) {
      user = await this.userModel.create({
        googleId: profile.googleId,
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
      });
    }

    // create payload
    const payload = { sub: String(user._id), email: user.email };

    // generate tokens
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.REFRESH_JWT_SECRET,
      expiresIn: '7d',
    });

    // save refresh token in DB
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    user.refreshToken = hashedRefreshToken;
    await user.save();

    // return type-safe object
    return {
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Check the validity of the provided refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.REFRESH_JWT_SECRET,
      });

      // Get the user from the db
      const user = await this.userModel.findById(payload.sub);
      if (!user) throw new UnauthorizedException('User not found');

      // Check if user has a stored refresh token
      if (!user.refreshToken) throw new UnauthorizedException('No refresh token found');

      // Compare provided refresh token with the stored hashed refresh token
      const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
        
      // If not valid, revoke tokens and throw error
      if (!isValid) {
        user.refreshToken = '';
        await user.save();
        throw new UnauthorizedException('Invalid or consumed refresh token. Tokens revoked.');
      }

      // Rotate tokens: create new refresh token and access token
      const newRefreshToken = await this.jwtService.signAsync(
        { sub: String(user._id), email: user.email },
        { secret: process.env.REFRESH_JWT_SECRET, expiresIn: '7d' }
      );
      const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10);

      // Store the new hashed refresh token in the database
      user.refreshToken = hashedNewRefreshToken;
      await user.save();

      // Make new access token
      const newAccessToken = await this.jwtService.signAsync(
        { sub: String(user._id), email: user.email },
        { secret: process.env.JWT_SECRET, expiresIn: '1h' }
      );

      // Return the new tokens
      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    }
    catch{throw new UnauthorizedException('Invalid or expired refresh token');}
  }

  async logout(userId: string): Promise<{ message: string }> {
    await this.userModel.findByIdAndUpdate(userId, { refreshToken: null });
    return { message: 'Logged out successfully' };
  }
}