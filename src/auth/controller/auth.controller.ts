import { Response } from 'express';
import {
  Body,
  Req,
  Res,
  Controller,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { RegisterInput } from '../dto/register-input';
import { LocalAuthGuard } from '../guard/local-auth.guard';
import { RequestWithUser } from '../requestWithUser.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerInput: RegisterInput) {
    return this.authService.register(registerInput);
  }

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: RequestWithUser, @Res() response: Response) {
    const { user } = req;
    const cookie = this.authService.getCookieWithJwtToken(user);
    response.setHeader('Set-Cookie', cookie);
    user.password = undefined!;
    return response.send(user);
  }
}
