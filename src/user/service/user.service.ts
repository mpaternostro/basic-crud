import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { CreateUserInput } from 'user/dto/create-user.input';
import { UpdateUserInput } from 'user/dto/update-user.input';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  findOneById(id: string) {
    return this.userRepository.findUser(id);
  }

  findOneByUsername(username: string) {
    return this.userRepository.findUserByUsername(username);
  }

  findAll() {
    return this.userRepository.findAllUsers();
  }

  create(createUserInput: CreateUserInput) {
    return this.userRepository.createUser(createUserInput);
  }

  update(updateUserInput: UpdateUserInput) {
    return this.userRepository.updateUser(updateUserInput);
  }

  remove(id: string) {
    return this.userRepository.removeUser(id);
  }

  async setCurrentRefreshToken(refreshToken: string, userId: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.updateUserRefreshToken({
      id: userId,
      hashedRefreshToken,
    });
  }

  async removeRefreshToken(userId: string) {
    return this.userRepository.updateUserRefreshToken({
      id: userId,
      hashedRefreshToken: null,
    });
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, username: string) {
    const user = await this.findOneByUsername(username);
    if (!user?.currentHashedRefreshToken) {
      throw new Error('User has no current hashed refresh token.');
    }
    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken,
    );

    if (isRefreshTokenMatching) {
      return user;
    }
  }
}
