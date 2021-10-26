import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from 'user/entities/user.entity';
import { TodoRepository } from '../repository/todo.repository';
import { CreateTodoInput } from '../dto/create-todo.input';
import { UpdateTodoInput } from '../dto/update-todo.input';
import { TodoQueryValues } from '../TodoQueryValues.type';

@Injectable()
export class TodoService {
  constructor(private todoRepository: TodoRepository) {}

  async findOne(queryValue: TodoQueryValues) {
    const todo = await this.todoRepository.findTodo(queryValue);
    if (!todo) {
      let response = '';
      if ('id' in queryValue) {
        response = `Todo # ${queryValue.id} does not exist`;
      } else {
        response = `Todo named '${queryValue.title}' does not exist`;
      }
      throw new HttpException(response, HttpStatus.NOT_FOUND);
    }
    return todo;
  }

  findAll() {
    return this.todoRepository.findAllTodos();
  }

  findAllByUserId(id: string) {
    return this.todoRepository.findAllTodosByUserId(id);
  }

  create(createTodoInput: CreateTodoInput, user: User) {
    return this.todoRepository.createTodo(createTodoInput, user);
  }

  async update(updateTodoInput: UpdateTodoInput) {
    const updatedTodo = await this.todoRepository.updateTodo(updateTodoInput);
    if (!updatedTodo) {
      throw new HttpException(
        `Could not update todo # ${updateTodoInput.id} as it does not exist`,
        HttpStatus.NOT_FOUND,
      );
    }
    return updatedTodo;
  }

  async remove(id: string) {
    const wasRemoved = await this.todoRepository.removeTodo(id);
    if (!wasRemoved) {
      throw new HttpException(
        `Could not remove todo # ${id} as it does not exist`,
        HttpStatus.NOT_FOUND,
      );
    }
    return wasRemoved;
  }
}
