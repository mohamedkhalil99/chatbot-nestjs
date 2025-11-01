import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { CreateUserDto } from "src/modules/user/dto/create-user.dto";
import { UserService } from "src/modules/user/user.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private usersService: UserService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_REDIRECT_URL!,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const { id, displayName, emails, photos } = profile;

    const createUserDto: CreateUserDto = {
      googleId: id,
      name: displayName,
      email: emails[0].value,
      avatar: photos?.[0]?.value,
    };

    const user = await this.usersService.createUser(createUserDto);

    done(null, user);
  }
}