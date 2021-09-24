import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoResolver } from './todo.resolver';
import { UserService } from 'user/user.service';

@Module({
  providers: [TodoResolver, TodoService, UserService],
})
export class TodoModule {}
