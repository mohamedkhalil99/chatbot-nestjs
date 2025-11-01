import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/schemas/user.schema';

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
}
