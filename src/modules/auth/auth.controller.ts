import { Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";

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
  async googleAuthRedirect(@Req() req: GoogleAuthRequest, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.handleGoogleLogin(req.user); 
    
    res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // يُرسل فقط عبر HTTPS
        sameSite: 'lax', 
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // نفس مدة صلاحية الـ JWT (7 أيام)
    });
    return {
        message: 'Google authentication successful',
        user: result.user,
        accessToken: result.accessToken, // يُحفظ في ذاكرة العميل (Memory)
    };
  }

  //Desc: User can refresh access token
  //Route: POST api/v1/auth/refresh
  //Access: Public
  @Post('refresh')
  async refresh(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) throw new UnauthorizedException('No refresh token');

    const tokens = await this.authService.refreshAccessToken(refreshToken);

    // تحديث refresh token في cookie إذا فيه rotation
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken: tokens.accessToken }; 
  }

  //Desc: User can logout
  //Route: POST api/v1/auth/logout
  //Access: Private
  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const userId = req.user.sub;
    await this.authService.logout(userId);

    // مسح الـ cookie
    res.clearCookie('refreshToken');

    return { message: 'Logged out successfully' };
  }
}