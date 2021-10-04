import * as bcrypt from 'bcrypt';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { isQueryFailedError } from 'utils/isQueryFailedError';
import { PostgresErrorCode } from 'utils/postgresErrorCode.enum';
import { UserRepository } from '../repository/user.repository';
import { CreateUserInput } from '../dto/create-user.input';
import { UpdateUserInput } from '../dto/update-user.input';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async findOneById(id: string): Promise<User> {
    const user = await this.userRepository.findUser(id);
    if (!user) {
      throw new HttpException(
        `User # ${id} does not exist`,
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }

  async findOneByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findUserByUsername(username);
    if (!user) {
      throw new HttpException(
        `User ${username} does not exist`,
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }

  async findOneByUsernameWithPassword(username: string): Promise<User> {
    const user = await this.userRepository.findUserByUsernameWithPassword(
      username,
    );
    if (!user) {
      throw new HttpException(
        `User ${username} does not exist`,
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.findAllUsers();
  }

  async create(createUserInput: CreateUserInput): Promise<User> {
    try {
      const newUser = await this.userRepository.createUser(createUserInput);
      return newUser;
    } catch (error) {
      if (
        isQueryFailedError(error) &&
        error.code === PostgresErrorCode.UniqueViolation
      ) {
        throw new HttpException(
          'Username already taken',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(updateUserInput: UpdateUserInput): Promise<User> {
    const updateUser = await this.userRepository.updateUser(updateUserInput);
    if (!updateUser) {
      throw new HttpException(
        `Could not update user ${updateUserInput.username} as it does not exist`,
        HttpStatus.NOT_FOUND,
      );
    }
    return updateUser;
  }

  async remove(id: string) {
    const wasRemoved = await this.userRepository.removeUser(id);
    if (!wasRemoved) {
      throw new HttpException(
        `Could not remove user # ${id} as it does not exist`,
        HttpStatus.NOT_FOUND,
      );
    }
    return wasRemoved;
  }

  async setCurrentRefreshToken(refreshToken: string, userId: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    const updatedUser = await this.userRepository.updateUserRefreshToken({
      id: userId,
      hashedRefreshToken,
    });
    if (!updatedUser) {
      throw new HttpException(
        `Could not update user # ${userId} as it does not exist`,
        HttpStatus.NOT_FOUND,
      );
    }
    return updatedUser;
  }

  async removeRefreshToken(userId: string): Promise<User> {
    const updatedUser = await this.userRepository.updateUserRefreshToken({
      id: userId,
      hashedRefreshToken: null,
    });
    if (!updatedUser) {
      throw new HttpException(
        `Could not update user # ${userId} as it does not exist`,
        HttpStatus.NOT_FOUND,
      );
    }
    return updatedUser;
  }

  async getUserIfRefreshTokenMatches(
    refreshToken: string,
    username: string,
  ): Promise<User | undefined> {
    const user = await this.findOneByUsername(username);
    if (!user.currentHashedRefreshToken) {
      throw new HttpException(
        'User has no current hashed refresh token',
        HttpStatus.BAD_REQUEST,
      );
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
