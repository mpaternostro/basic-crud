import { ConfigService } from '@nestjs/config';
import { HttpException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserInput } from 'user/dto/create-user.input';
import { User } from 'user/entities/user.entity';
import { UserService } from 'user/service/user.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt');
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest.fn().mockResolvedValue(new User()),
            findOneWithPassword: jest.fn().mockResolvedValue(new User()),
          },
        },
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            get(key: string) {
              switch (key) {
                case 'JWT_ACCESS_TOKEN_EXPIRATION_TIME':
                  return '3600';
                case 'JWT_REFRESH_TOKEN_EXPIRATION_TIME':
                  return '7200';
                case 'JWT_ACCESS_TOKEN_SECRET':
                  return 'secret';
                case 'JWT_REFRESH_TOKEN_SECRET':
                  return 'refreshsecret';
              }
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('token'),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should return a new user after creating it', async () => {
    const createUserInput = new CreateUserInput();

    expect(await authService.register(createUserInput)).toBeInstanceOf(User);
  });

  it('should return authenticated user', async () => {
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

    expect(
      await authService.getAuthenticatedUser('test', 'test'),
    ).toBeInstanceOf(User);
  });

  it('should return an error because passwords did not match', async () => {
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

    await expect(
      authService.getAuthenticatedUser('test', 'test'),
    ).rejects.toThrow(HttpException);
  });

  it('should return cookie with access token', () => {
    const user = new User();

    expect(authService.getCookieWithJwtAccessToken(user)).toMatch(
      'Authentication',
    );
  });

  it('should return cookie with refresh token', () => {
    const user = new User();

    expect(authService.getCookieWithJwtRefreshToken(user).cookie).toMatch(
      'Refresh',
    );
  });
});
