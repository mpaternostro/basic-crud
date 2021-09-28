import { Module } from '@nestjs/common';
import { UserService } from 'user/service/user.service';
import { UserRepository } from 'user/repository/user.repository';
import { TodoService } from './service/todo.service';
import { TodoResolver } from './resolver/todo.resolver';

@Module({
  providers: [TodoResolver, TodoService, UserService, UserRepository],
})
export class TodoModule {}
