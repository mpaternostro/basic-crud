import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from 'auth/service/auth.service';
import { CreateUserInput } from 'user/dto/create-user.input';
import { User } from 'user/entities/user.entity';
import { UserService } from 'user/service/user.service';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let authController: AuthController;
  let userService: UserService;

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
            getCookieWithJwtAccessToken: jest.fn().mockReturnValue({
              token: 'accessToken',
              cookie: 'accessTokenCookie',
            }),
            getCookieWithJwtRefreshToken: jest.fn().mockReturnValue({
              token: 'refreshToken',
              cookie: 'refreshTokenCookie',
            }),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    userService = module.get<UserService>(UserService);
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

  it('should set header and return user on login', async () => {
    const user = new User();
    const requestWithUser = {
      user,
      res: {
        setHeader: jest.fn(),
      },
    };

    expect(await authController.login(requestWithUser as any)).toBeInstanceOf(
      User,
    );
    expect(requestWithUser.res.setHeader).toHaveBeenCalledTimes(1);
    expect(requestWithUser.res.setHeader).toHaveBeenCalledWith('Set-Cookie', [
      'accessTokenCookie',
      'refreshTokenCookie',
    ]);
    expect(userService.setCurrentRefreshToken).toHaveBeenCalledWith(
      'refreshToken',
      user.id,
    );
  });

  it('should return an error when Response object is not provided on login', async () => {
    const user = new User();
    const requestWithoutResponse = {
      user,
    };

    await expect(
      authController.login(requestWithoutResponse as any),
    ).rejects.toThrow();
  });

  it('should set header and return user on token refresh', async () => {
    const user = new User();
    const requestWithUser = {
      user,
      res: {
        setHeader: jest.fn(),
      },
    };

    expect(await authController.refresh(requestWithUser as any)).toBeInstanceOf(
      User,
    );
    expect(requestWithUser.res.setHeader).toHaveBeenCalledTimes(1);
    expect(requestWithUser.res.setHeader).toHaveBeenCalledWith('Set-Cookie', [
      'accessTokenCookie',
      'refreshTokenCookie',
    ]);
    expect(userService.setCurrentRefreshToken).toHaveBeenCalledWith(
      'refreshToken',
      user.id,
    );
  });

  it('should return an error when Response object is not provided on token refresh', async () => {
    const user = new User();
    const requestWithoutResponse = {
      user,
    };

    await expect(() =>
      authController.refresh(requestWithoutResponse as any),
    ).rejects.toThrow();
  });

  it('should set header on logout', async () => {
    const user = new User();
    const requestWithUser = {
      user,
      res: {
        setHeader: jest.fn(),
      },
    };

    await authController.logOut(requestWithUser as any);
    expect(requestWithUser.res.setHeader).toHaveBeenCalledTimes(1);
  });

  it('should return an error when Response object is not provided on logout', async () => {
    const user = new User();
    const requestWithoutResponse = {
      user,
    };

    await expect(
      authController.logOut(requestWithoutResponse as any),
    ).rejects.toThrow();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
