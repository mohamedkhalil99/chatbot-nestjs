import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthGuard } from "@nestjs/passport";

interface GoogleUser {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
}
interface GoogleAuthRequest extends Request {
  user: GoogleUser;
} 

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //Desc: Initiates Google OAuth login
  //Route: GET api/v1/auth/google
  //Access: Public  
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {
    // Initiates the Google OAuth login process
  }

  //Desc: Handles Google OAuth redirect
  //Route: GET api/v1/auth/google/redirect
  //Access: Public
  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: GoogleAuthRequest) {
    const result = await this.authService.handleGoogleLogin(req.user);

    return {
      message: 'Google authentication successful',
      ...result,
    };
  }
}