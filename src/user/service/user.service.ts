import * as bcrypt from 'bcrypt';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isQueryFailedError } from 'utils/isQueryFailedError';
import { PostgresErrorCode } from 'utils/postgresErrorCode.enum';
import { UserRepository } from '../repository/user.repository';
import { CreateUserInput } from '../dto/create-user.input';
import { UpdateUserInput } from '../dto/update-user.input';
import { User } from '../entities/user.entity';
import { UserQueryValues } from '../UserQueryValues.type';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private configService: ConfigService,
  ) {}
  async findOne(queryValue: UserQueryValues): Promise<User> {
    const user = await this.userRepository.findUser(queryValue);
    if (!user) {
      let response = '';
      if ('id' in queryValue) {
        response = `User # ${queryValue.id} does not exist`;
      } else {
        response = `User ${queryValue.username} does not exist`;
      }
      throw new HttpException(response, HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async findOneWithPassword(queryValue: UserQueryValues): Promise<User> {
    const user = await this.userRepository.findUserWithPassword(queryValue);
    if (!user) {
      let response = '';
      if ('id' in queryValue) {
        response = `User # ${queryValue.id} does not exist`;
      } else {
        response = `User ${queryValue.username} does not exist`;
      }
      throw new HttpException(response, HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.findAllUsers();
  }

  async verifyPassword(plainTextPassword: string, userId: string) {
    const userWithPassword = await this.findOneWithPassword({ id: userId });
    return bcrypt.compare(plainTextPassword, userWithPassword.password);
  }

  private async hashString(stringToHash: string) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const salt = this.configService.get<number>('PASSWORD_SALT')!;
    return bcrypt.hash(stringToHash, salt);
  }

  async create(createUserInput: CreateUserInput): Promise<User> {
    const hashedPassword = await this.hashString(createUserInput.password);
    try {
      const newUser = await this.userRepository.createUser({
        username: createUserInput.username,
        password: hashedPassword,
      });
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
    if (updateUserInput.password) {
      updateUserInput.password = await this.hashString(
        updateUserInput.password,
      );
    }
    if (updateUserInput.username) {
      // if username changed, user refresh token must be nullified
      updateUserInput.currentHashedRefreshToken = null;
    }
    const updateUser = await this.userRepository.updateUser(updateUserInput);
    // we are sure that the user exists as we previously verified currentPassword
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return updateUser!;
  }

  async remove(id: string): Promise<User> {
    const wasRemoved = await this.userRepository.removeUser(id);
    // we are sure that the user exists as we previously verified currentPassword
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return wasRemoved!;
  }

  /**
   * Store refresh token in database so we can later check if it's valid when user tries
   * to refresh token
   */
  async setCurrentRefreshToken(refreshToken: string, userId: string) {
    const hashedRefreshToken = await this.hashString(refreshToken);
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
  ): Promise<User> {
    const user = await this.findOne({ username });
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
    throw new HttpException(
      'Refresh token does not match with stored refresh token',
      HttpStatus.BAD_REQUEST,
    );
  }
}
