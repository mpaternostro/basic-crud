import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { RemoveUserInput } from 'user/dto/remove-user.input';
import { UpdateUserInput } from 'user/dto/update-user.input';
import { UserService } from 'user/service/user.service';

type UserInputValues =
  | { updateUserInput: UpdateUserInput }
  | { removeUserInput: RemoveUserInput };

@Injectable()
export class VerifyPasswordGuard implements CanActivate {
  constructor(private userService: UserService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const args = ctx.getArgs<UserInputValues>();
    const { id, currentPassword } =
      'updateUserInput' in args ? args.updateUserInput : args.removeUserInput;
    const isValidPassword = await this.userService.verifyPassword(
      currentPassword,
      id,
    );
    if (!isValidPassword) {
      throw new HttpException(
        'Passwords did not match',
        HttpStatus.BAD_REQUEST,
      );
    }
    return isValidPassword;
  }
}
