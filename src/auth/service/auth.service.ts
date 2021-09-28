import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from 'user/service/user.service';
import { RegisterInput } from '../dto/register-input';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  async register(registerInput: RegisterInput) {
    const hashedPassword = await bcrypt.hash(registerInput.password, 10);
    // try {
    const createdUser = await this.userService.create({
      username: registerInput.username,
      password: hashedPassword,
    });
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
}
