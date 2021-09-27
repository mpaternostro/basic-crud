import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { TodoModule } from 'todo/todo.module';
import { TodoService } from 'todo/service/todo.service';
import { UserService } from './service/user.service';
import { UserResolver } from './resolver/user.resolver';

@Module({
  imports: [TodoModule],
  providers: [UserResolver, UserService, TodoService],
})
export class UserModule {}
