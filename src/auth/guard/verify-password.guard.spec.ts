import { ExecutionContext, HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from 'user/service/user.service';
import { VerifyPasswordGuard } from './verify-password.guard';

describe('Verify Password Guard', () => {
  const mockExecutionContext: Partial<
    Record<
      jest.FunctionPropertyNames<ExecutionContext>,
      jest.MockedFunction<any>
    >
  > = {
    getType: jest.fn(),
    getArgs: jest.fn().mockReturnValue([
      undefined,
      {
        updateUserInput: {
          id: '1',
          currentPassword: 'newsecurepassword',
        },
      },
    ]),
    getClass: jest.fn(),
    getHandler: jest.fn(),
  };
  let verifyPasswordGuard: VerifyPasswordGuard;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UserService,
          useValue: {
            verifyPassword: jest.fn().mockResolvedValue(true),
          },
        },
        VerifyPasswordGuard,
      ],
    }).compile();

    verifyPasswordGuard = module.get<VerifyPasswordGuard>(VerifyPasswordGuard);
    userService = module.get<UserService>(UserService);
  });

  it('should return true if passwords match while updating user', async () => {
    expect(
      await verifyPasswordGuard.canActivate(mockExecutionContext as any),
    ).toBe(true);
  });

  it('should return true if passwords match is valid while removing user', async () => {
    mockExecutionContext.getArgs = jest.fn().mockReturnValue([
      undefined,
      {
        removeUserInput: {
          id: '1',
          currentPassword: 'newsecurepassword',
        },
      },
    ]);

    expect(
      await verifyPasswordGuard.canActivate(mockExecutionContext as any),
    ).toBe(true);
  });

  it('should throw if passwords did not match while updating user', async () => {
    jest.spyOn(userService, 'verifyPassword').mockResolvedValue(false);

    await expect(
      verifyPasswordGuard.canActivate(mockExecutionContext as any),
    ).rejects.toThrow(HttpException);
  });
});
