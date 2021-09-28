import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoModule } from 'todo/todo.module';
import { TodoService } from 'todo/service/todo.service';
import { UserService } from './service/user.service';
import { UserResolver } from './resolver/user.resolver';
import { UserRepository } from './repository/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserRepository]), TodoModule],
  providers: [UserResolver, UserService, TodoService],
})
export class UserModule {}
