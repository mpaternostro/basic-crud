import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from 'user/entities/user.entity';
import { UserService } from 'user/service/user.service';
import { RegisterInput } from '../dto/register-input';
import { TokenPayload } from '../tokenPayload.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerInput: RegisterInput) {
    const hashedPassword = await bcrypt.hash(registerInput.password, 10);
    // try {
    const createdUser = await this.userService.create({
      username: registerInput.username,
      password: hashedPassword,
    });
    createdUser.password = undefined!;
    return createdUser;
  }

  async verifyPassword(plainTextPassword: string, hashedPassword: string) {
    return bcrypt.compare(plainTextPassword, hashedPassword);
  }

  async getAuthenticatedUser(username: string, password: string) {
    const user = await this.userService.findOneByUsername(username);
    if (!user) {
      throw new Error('User not found.');
    }
    const isPasswordMatching = this.verifyPassword(password, user.password);
    if (!isPasswordMatching) {
      throw new Error('Password did not match.');
    }
    return user;
  }

  getCookieWithJwtToken(user: User) {
    const payload: TokenPayload = { username: user.username, sub: user.id };
    const token = this.jwtService.sign(payload);
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      'JWT_EXPIRATION_TIME',
    )}`;
  }

  getCookieForLogOut() {
    return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
  }
}
