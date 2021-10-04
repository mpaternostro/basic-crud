import { Injectable } from '@nestjs/common';
import { User } from 'user/entities/user.entity';
import { TodoRepository } from '../repository/todo.repository';
import { CreateTodoInput } from '../dto/create-todo.input';
import { UpdateTodoInput } from '../dto/update-todo.input';

@Injectable()
export class TodoService {
  constructor(private todoRepository: TodoRepository) {}

  findOneById(id: string) {
    return this.todoRepository.findTodoById(id);
  }

  findAll() {
    return this.todoRepository.findAllTodos();
  }

  findAllByUserId(id: string) {
    return this.todoRepository.findAllTodosByUserId(id);
  }

  findAllByUserIdWithUser(id: string) {
    return this.todoRepository.findAllTodosByUserIdWithUser(id);
  }

  create(createTodoInput: CreateTodoInput, user: User) {
    return this.todoRepository.createTodo(createTodoInput, user);
  }

  update(updateTodoInput: UpdateTodoInput) {
    return this.todoRepository.updateTodo(updateTodoInput);
  }

  remove(id: string) {
    return this.todoRepository.removeTodo(id);
  }
}
