import * as bcrypt from 'bcrypt';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CreateUserInput } from 'user/dto/create-user.input';
import { User } from 'user/entities/user.entity';
import { UserService } from 'user/service/user.service';
import { TokenPayload } from '../tokenPayload.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(createUserInput: CreateUserInput) {
    return this.userService.create(createUserInput);
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    return bcrypt.compare(plainTextPassword, hashedPassword);
  }

  async getAuthenticatedUser(username: string, password: string) {
    const user = await this.userService.findOneByUsernameWithPassword(username);
    const isPasswordMatching = await this.verifyPassword(
      password,
      user.password,
    );
    if (!isPasswordMatching) {
      throw new HttpException(
        'Passwords did not match',
        HttpStatus.BAD_REQUEST,
      );
    }
    return user;
  }

  getCookieWithJwtAccessToken(user: User) {
    const payload: TokenPayload = { username: user.username, sub: user.id };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.get<string>(
        'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
      )}`,
    });
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get<string>(
      'JWT_EXPIRATION_TIME',
    )}`;
  }

  getCookieWithJwtRefreshToken(user: User) {
    const payload: TokenPayload = { username: user.username, sub: user.id };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.get<string>(
        'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
      )}`,
    });
    const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get<string>(
      'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
    )}`;
    return {
      cookie,
      token,
    };
  }

  getCookiesForLogOut() {
    return [
      'Authentication=; HttpOnly; Path=/; Max-Age=0',
      'Refresh=; HttpOnly; Path=/; Max-Age=0',
    ];
  }
}
