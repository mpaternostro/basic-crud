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
import { Todo } from 'todo/entities/todo.entity';

@Resolver('Todo')
@UseGuards(GqlAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class TodoResolver {
  constructor(private readonly todoService: TodoService) {}

  @Query('todo')
  async findOne(@Args('id') id: string): Promise<Todo | undefined> {
    return this.todoService.findOne({ id });
  }

  @Query('todos')
  async findAll(@CurrentUser() user: User): Promise<Todo[]> {
    return this.todoService.findAllByUserId(user.id);
  }

  @ResolveField('user')
  async findUser(@Parent() todo, @CurrentUser() user: User): Promise<User> {
    return user;
  }

  @Mutation('createTodo')
  create(
    @Args('createTodoInput') createTodoInput: CreateTodoInput,
    @CurrentUser() user: User,
  ): Promise<Todo> {
    return this.todoService.create(createTodoInput, user);
  }

  @Mutation('updateTodo')
  async update(
    @Args('updateTodoInput') updateTodoInput: UpdateTodoInput,
  ): Promise<Todo> {
    return this.todoService.update(updateTodoInput);
  }

  @Mutation('removeTodo')
  async remove(@Args('id') id: string) {
    return this.todoService.remove(id);
  }
}
