import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { TodoService } from './todo.service';
import { CreateTodoInput } from './dto/create-todo.input';
import { UpdateTodoInput } from './dto/update-todo.input';
import { UserService } from 'user/user.service';

@Resolver('Todo')
export class TodoResolver {
  constructor(
    private readonly todoService: TodoService,
    private readonly userService: UserService,
  ) {}

  @Mutation('createTodo')
  create(@Args('createTodoInput') createTodoInput: CreateTodoInput) {
    return this.todoService.create(createTodoInput);
  }

  @Query('todos')
  findAll() {
    return this.todoService.findAll();
  }

  @Query('todo')
  findOne(@Args('id') id: string) {
    return this.todoService.findOneById(id);
  }

  @ResolveField('user')
  async findUser(@Parent() todo) {
    const { id } = todo;
    return this.userService.findOneById(id);
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
