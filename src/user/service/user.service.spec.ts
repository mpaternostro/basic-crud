import * as bcrypt from 'bcrypt';
import { QueryFailedError, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { CreateUserInput } from '../dto/create-user.input';
import { UpdateUserInput } from '../dto/update-user.input';
import { UserQueryValues } from '../UserQueryValues.type';
import { User } from '../entities/user.entity';
import { UserRepository } from '../repository/user.repository';

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<unknown>;
};

export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(
  () => ({}),
);

jest.mock('bcrypt', () => {
  return {
    async hash() {
      return '$2b$10$lkjsdflkjdflkjsdf';
    },
    async compare() {
      return true;
    },
  };
});

describe('UserService', () => {
  let userService: UserService;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        ConfigService,
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
        UserRepository,
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('service should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('should return a single user', async () => {
    const expectedResult = new User();
    const queryValue: UserQueryValues = {
      id: '123',
    };
    jest
      .spyOn(userRepository, 'findUser')
      .mockImplementation(() => Promise.resolve(expectedResult));
    expect(await userService.findOne(queryValue)).toEqual(expectedResult);
  });

  it('should throw an error because user with id 123 was not found', async () => {
    const expectedResult = undefined;
    const queryValue: UserQueryValues = {
      id: '123',
    };
    jest
      .spyOn(userRepository, 'findUser')
      .mockImplementation(() => Promise.resolve(expectedResult));
    jest
      .spyOn(userRepository, 'findUserWithPassword')
      .mockImplementation(() => Promise.resolve(expectedResult));
    await expect(userService.findOne(queryValue)).rejects.toThrow(
      HttpException,
    );
    await expect(userService.findOneWithPassword(queryValue)).rejects.toThrow(
      HttpException,
    );
  });

  it("should throw an error because user 'tester' was not found", async () => {
    const expectedResult = undefined;
    const queryValue: UserQueryValues = {
      username: 'tester',
    };
    jest
      .spyOn(userRepository, 'findUser')
      .mockImplementation(() => Promise.resolve(expectedResult));
    jest
      .spyOn(userRepository, 'findUserWithPassword')
      .mockImplementation(() => Promise.resolve(expectedResult));
    await expect(userService.findOne(queryValue)).rejects.toThrow(
      HttpException,
    );
    await expect(userService.findOneWithPassword(queryValue)).rejects.toThrow(
      HttpException,
    );
  });

  it('should return all users', async () => {
    const expectedResult = [new User()];
    jest
      .spyOn(userRepository, 'findAllUsers')
      .mockImplementation(() => Promise.resolve(expectedResult));
    expect(await userService.findAll()).toEqual(expectedResult);
  });

  it('should verify is password is correct', async () => {
    const expectedResult = new User();
    const password = 'password';
    const someUserId = '123';
    jest
      .spyOn(userRepository, 'findUserWithPassword')
      .mockImplementation(() => Promise.resolve(expectedResult));
    expect(await userService.verifyPassword(password, someUserId)).toEqual(
      true,
    );
  });

  it('should create a new user', async () => {
    const expectedResult = new User();
    const createUserInput = new CreateUserInput();
    jest
      .spyOn(userRepository, 'createUser')
      .mockImplementation(() => Promise.resolve(expectedResult));
    expect(await userService.create(createUserInput)).toEqual(expectedResult);
  });

  it('should throw an error when creating a new user', async () => {
    const createUserInput = new CreateUserInput();
    const queryError = new QueryFailedError(
      'duplicate key value violates unique constraint "users_username_key"',
      ['tester', 'newpassword'],
      {
        code: '23505',
      },
    );
    const error = new Error('Something happened');
    jest
      .spyOn(userRepository, 'createUser')
      .mockImplementationOnce(() => Promise.reject(queryError));
    await expect(userService.create(createUserInput)).rejects.toThrow(
      HttpException,
    );

    jest
      .spyOn(userRepository, 'createUser')
      .mockImplementationOnce(() => Promise.reject(error));
    await expect(userService.create(createUserInput)).rejects.toThrow(
      HttpException,
    );
  });

  it('should update a user', async () => {
    const expectedResult = new User();
    const updateUserInput = new UpdateUserInput();
    updateUserInput.username = 'updatedtester';
    updateUserInput.password = 'newsecurepassword';
    jest
      .spyOn(userRepository, 'findUserWithPassword')
      .mockImplementation(() => Promise.resolve(expectedResult));
    jest
      .spyOn(userRepository, 'updateUser')
      .mockImplementation(() => Promise.resolve(expectedResult));
    expect(await userService.update(updateUserInput)).toEqual(expectedResult);

    // Test without new username and password
    updateUserInput.username = undefined;
    updateUserInput.password = undefined;
    expect(await userService.update(updateUserInput)).toEqual(expectedResult);
  });

  it('should remove a user', async () => {
    const expectedResult = new User();
    const someUserId = '123';
    jest
      .spyOn(userRepository, 'removeUser')
      .mockImplementation(() => Promise.resolve(expectedResult));
    expect(await userService.remove(someUserId)).toEqual(expectedResult);
  });

  it('should set refresh token', async () => {
    const expectedResult = new User();
    const someUserId = '123';
    const someRefreshToken = 'refreshtoken';
    jest
      .spyOn(userRepository, 'updateUserRefreshToken')
      .mockImplementation(() => Promise.resolve(expectedResult));
    expect(
      await userService.setCurrentRefreshToken(someUserId, someRefreshToken),
    ).toEqual(expectedResult);
  });

  it('should throw an error when updating user refresh token', async () => {
    const expectedResult = undefined;
    const someUserId = '123';
    const someRefreshToken = 'refreshtoken';
    jest
      .spyOn(userRepository, 'updateUserRefreshToken')
      .mockImplementation(() => Promise.resolve(expectedResult));
    await expect(
      userService.setCurrentRefreshToken(someUserId, someRefreshToken),
    ).rejects.toThrow(HttpException);
  });

  it('should remove user refresh token', async () => {
    const expectedResult = new User();
    const someUserId = '123';
    jest
      .spyOn(userRepository, 'updateUserRefreshToken')
      .mockImplementation(() => Promise.resolve(expectedResult));
    expect(await userService.removeRefreshToken(someUserId)).toEqual(
      expectedResult,
    );
  });

  it('should throw an error when removing user refresh token', async () => {
    const expectedResult = undefined;
    const someUserId = '123';
    jest
      .spyOn(userRepository, 'updateUserRefreshToken')
      .mockImplementation(() => Promise.resolve(expectedResult));
    await expect(userService.removeRefreshToken(someUserId)).rejects.toThrow(
      HttpException,
    );
  });

  it('should get user if refresh token matches', async () => {
    const expectedResult = new User();
    expectedResult.currentHashedRefreshToken = 'hashedrefreshtoken';
    const username = 'tester';
    const someRefreshToken = 'refreshtoken';
    jest
      .spyOn(userRepository, 'findUser')
      .mockImplementation(() => Promise.resolve(expectedResult));
    expect(
      await userService.getUserIfRefreshTokenMatches(
        someRefreshToken,
        username,
      ),
    ).toEqual(expectedResult);

    // Refresh token does not match
    jest
      .spyOn(bcrypt, 'compare')
      .mockImplementationOnce(() => Promise.resolve(false));
    await expect(
      userService.getUserIfRefreshTokenMatches(someRefreshToken, username),
    ).rejects.toThrow(HttpException);
  });

  it('should throw an error if user has no hashed refresh token', async () => {
    const expectedResult = new User();
    const username = 'tester';
    const someRefreshToken = 'refreshtoken';
    jest
      .spyOn(userRepository, 'findUser')
      .mockImplementation(() => Promise.resolve(expectedResult));
    await expect(
      userService.getUserIfRefreshTokenMatches(someRefreshToken, username),
    ).rejects.toThrow(HttpException);
  });
});
