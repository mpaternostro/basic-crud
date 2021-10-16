import {
  Body,
  Req,
  Controller,
  HttpCode,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { CreateUserInput } from 'user/dto/create-user.input';
import { User } from 'user/entities/user.entity';
import { UserService } from 'user/service/user.service';
import { AuthService } from '../service/auth.service';
import { LocalAuthGuard } from '../guard/local-auth.guard';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { JwtRefreshTokenGuard } from '../guard/jwt-refresh-token-auth.guard';
import { RequestWithUser } from '../requestWithUser.interface';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  async register(@Body() createUserInput: CreateUserInput): Promise<User> {
    return this.authService.register(createUserInput);
  }

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: RequestWithUser): Promise<User> {
    const { user, res } = req;
    const accessTokenCookie =
      this.authService.getCookieWithJwtAccessToken(user);
    const { token: refreshToken, cookie: refreshTokenCookie } =
      this.authService.getCookieWithJwtRefreshToken(user);
    await this.userService.setCurrentRefreshToken(refreshToken, user.id);
    if (!res) {
      throw new Error('Cannot access Response.');
    }
    res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);
    return user;
  }

  @UseGuards(JwtRefreshTokenGuard)
  @Get('refresh')
  refresh(@Req() request: RequestWithUser): User {
    const { res } = request;
    const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(
      request.user,
    );
    if (!res) {
      throw new Error('Cannot access Response.');
    }

    res.setHeader('Set-Cookie', accessTokenCookie);
    return request.user;
  }

  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logOut(@Req() req: RequestWithUser) {
    const { res } = req;
    if (!res) {
      throw new Error('Cannot access Response.');
    }
    await this.userService.removeRefreshToken(req.user.id);
    res.setHeader('Set-Cookie', this.authService.getCookiesForLogOut());
  }
}
