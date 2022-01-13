import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from 'user/entities/user.entity';
import { UserService } from 'user/service/user.service';
import { AuthService } from '../service/auth.service';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { JwtRefreshTokenStrategy } from './jwt-refresh-token.strategy';

describe('Auth Strategies', () => {
  let localStrategy: LocalStrategy;
  let jwtStrategy: JwtStrategy;
  let jwtRefreshTokenStrategy: JwtRefreshTokenStrategy;
  const tokenPayload = { username: 'username' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UserService,
          useValue: {
            findOne: jest.fn().mockResolvedValue(new User()),
            getUserIfRefreshTokenMatches: jest
              .fn()
              .mockResolvedValue(new User()),
          },
        },
        {
          provide: AuthService,
          useValue: {
            getAuthenticatedUser: jest.fn().mockResolvedValue(new User()),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get(key: string) {
              switch (key) {
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
        LocalStrategy,
        JwtStrategy,
        JwtRefreshTokenStrategy,
      ],
    }).compile();

    localStrategy = module.get<LocalStrategy>(LocalStrategy);
    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    jwtRefreshTokenStrategy = module.get<JwtRefreshTokenStrategy>(
      JwtRefreshTokenStrategy,
    );
  });

  it('local strategy should be defined', () => {
    expect(localStrategy).toBeDefined();
  });

  it('jwt strategy should be defined', () => {
    expect(jwtStrategy).toBeDefined();
  });

  it('jwt refresh token strategy should be defined', () => {
    expect(jwtRefreshTokenStrategy).toBeDefined();
  });

  it('should validate user credentials', async () => {
    expect(await localStrategy.validate('username', 'password')).toBeInstanceOf(
      User,
    );
  });

  it('should return current user', async () => {
    expect(await jwtStrategy.validate(tokenPayload as any)).toBeInstanceOf(
      User,
    );
  });

  it('should return if refresh token matches', async () => {
    const request = {
      cookies: {
        Refresh: 'refreshtoken',
      },
    };
    expect(
      await jwtRefreshTokenStrategy.validate(
        request as any,
        tokenPayload as any,
      ),
    ).toBeInstanceOf(User);
  });
});
