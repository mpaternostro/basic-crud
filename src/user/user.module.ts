import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { TodoModule } from 'todo/todo.module';
import { TodoService } from 'todo/todo.service';

@Module({
  imports: [TodoModule],
  providers: [UserResolver, UserService, TodoService],
})
export class UserModule {}
