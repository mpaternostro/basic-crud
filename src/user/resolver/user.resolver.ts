import { Request } from 'express';
import {
  ClassSerializerInterceptor,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
  Context,
} from '@nestjs/graphql';
import { getCookiesForLogOut } from 'utils/getCookiesForLogOut';
import { GqlAuthGuard } from 'auth/guard/gql-auth.guard';
import { CurrentUser } from 'auth/current-user.decorator';
import { Todo } from 'todo/entities/todo.entity';
import { TodoService } from 'todo/service/todo.service';
import { User } from '../entities/user.entity';
import { UserService } from '../service/user.service';
import { CreateUserInput } from '../dto/create-user.input';
import { UpdateUserInput } from '../dto/update-user.input';
import { RemoveUserInput } from '../dto/remove-user.input';
import { VerifyPasswordGuard } from 'auth/guard/verify-password.guard';

@Resolver('User')
@UseGuards(GqlAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly todoService: TodoService,
  ) {}

  @Query('whoAmI')
  whoAmI(@CurrentUser() user: User): User {
    return user;
  }

  @Query('user')
  async findOne(@Args('id') id: string): Promise<User> {
    return this.userService.findOne({ id });
  }

  @Query('users')
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @ResolveField('todos')
  async findTodos(@Parent() user: User): Promise<Todo[]> {
    const { id } = user;
    return this.todoService.findAllByUserId(id);
  }

  @Mutation('createUser')
  create(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<User> {
    return this.userService.create(createUserInput);
  }

  @UseGuards(VerifyPasswordGuard)
  @Mutation('updateUser')
  async update(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @Context('req') req: Request,
  ): Promise<User> {
    const updatedUser = await this.userService.update(updateUserInput);
    if (updateUserInput.username) {
      // if username changed, user must be logged out
      req.res?.setHeader('Set-Cookie', getCookiesForLogOut());
    }
    return updatedUser;
  }

  @UseGuards(VerifyPasswordGuard)
  @Mutation('removeUser')
  remove(@Args('removeUserInput') removeUserInput: RemoveUserInput) {
    return this.userService.remove(removeUserInput.id);
  }
}
