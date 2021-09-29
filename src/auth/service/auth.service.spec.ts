import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'user/entities/user.entity';
import { UserRepository } from 'user/repository/user.repository';
import { UserService } from 'user/service/user.service';
import { AuthService } from './auth.service';

const mockedConfigService = {
  get(key: string) {
    switch (key) {
      case 'JWT_ACCESS_TOKEN_EXPIRATION_TIME':
        return '3600';
    }
  },
};

const mockedJwtService = {
  sign: () => '',
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: mockedConfigService,
        },
        {
          provide: JwtService,
          useValue: mockedJwtService,
        },
        UserRepository,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
