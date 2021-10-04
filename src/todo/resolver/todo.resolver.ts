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
} from '@nestjs/graphql';
import { User } from 'user/entities/user.entity';
import { GqlAuthGuard } from 'auth/guard/gql-auth.guard';
import { CurrentUser } from 'auth/current-user.decorator';
import { TodoService } from '../service/todo.service';
import { CreateTodoInput } from '../dto/create-todo.input';
import { UpdateTodoInput } from '../dto/update-todo.input';

@Resolver('Todo')
@UseGuards(GqlAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class TodoResolver {
  constructor(private readonly todoService: TodoService) {}

  @Query('todo')
  findOne(@Args('id') id: string) {
    return this.todoService.findOneById(id);
  }

  @Query('todos')
  findAll(@CurrentUser() user: User) {
    return this.todoService.findAllByUserId(user.id);
  }

  @ResolveField('user')
  async findUser(@Parent() todo, @CurrentUser() user: User) {
    return user;
  }

  @Mutation('createTodo')
  create(
    @Args('createTodoInput') createTodoInput: CreateTodoInput,
    @CurrentUser() user: User,
  ) {
    return this.todoService.create(createTodoInput, user);
  }

  @Mutation('updateTodo')
  update(@Args('updateTodoInput') updateTodoInput: UpdateTodoInput) {
    return this.todoService.update(updateTodoInput);
  }

  @Mutation('removeTodo')
  remove(@Args('id') id: string) {
    return this.todoService.remove(id);
  }
}
