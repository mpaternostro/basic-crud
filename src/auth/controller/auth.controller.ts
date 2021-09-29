import {
  Body,
  Req,
  Controller,
  HttpCode,
  Post,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { RegisterInput } from '../dto/register-input';
import { LocalAuthGuard } from '../guard/local-auth.guard';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { RequestWithUser } from '../requestWithUser.interface';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerInput: RegisterInput) {
    return this.authService.register(registerInput);
  }

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: RequestWithUser) {
    const { user, res } = req;
    const cookie = this.authService.getCookieWithJwtToken(user);
    if (!res) {
      throw new Error('Cannot access Response.');
    }
    res.setHeader('Set-Cookie', cookie);
    return user;
  }

  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logOut(@Req() req: RequestWithUser) {
    const { res } = req;
    if (!res) {
      throw new Error('Cannot access Response.');
    }
    res.setHeader('Set-Cookie', this.authService.getCookieForLogOut());
  }
}
