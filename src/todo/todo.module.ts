import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoService } from './service/todo.service';
import { TodoResolver } from './resolver/todo.resolver';
import { TodoRepository } from './repository/todo.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TodoRepository])],
  providers: [TodoResolver, TodoService],
  exports: [TodoService],
})
export class TodoModule {}
