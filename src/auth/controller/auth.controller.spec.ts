import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from 'auth/service/auth.service';
import { Repository } from 'typeorm';
import { CreateUserInput } from 'user/dto/create-user.input';
import { User } from 'user/entities/user.entity';
import { UserService } from 'user/service/user.service';
import { AuthController } from './auth.controller';

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<unknown>;
};

export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(
  () => ({}),
);

describe('AuthController', () => {
  let authController: AuthController;
  // let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: UserService,
          useValue: {
            setCurrentRefreshToken: jest.fn(),
            removeRefreshToken: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            register: jest.fn().mockResolvedValue(new User()),
            getCookieWithJwtAccessToken: jest.fn(),
            getCookieWithJwtRefreshToken: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    // userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  it('should return a new user', async () => {
    const createUserInput = new CreateUserInput();
    createUserInput.username = 'test';
    createUserInput.password = 'newpassword';
    expect(await authController.register(createUserInput)).toBeInstanceOf(User);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
