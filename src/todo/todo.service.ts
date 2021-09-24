import { Injectable } from '@nestjs/common';
import { CreateTodoInput } from './dto/create-todo.input';
import { UpdateTodoInput } from './dto/update-todo.input';

@Injectable()
export class TodoService {
  create(createTodoInput: CreateTodoInput) {
    return 'This action adds a new todo';
  }

  findAll() {
    return `This action returns all todo`;
  }

  findAllByUserId(id) {
    return `This action returns all todo`;
  }

  findOneById(id: string) {
    return `This action returns a #${id} todo`;
  }

  update(updateTodoInput: UpdateTodoInput) {
    return `This action updates a #${updateTodoInput.id} todo with new title ${
      updateTodoInput.title
    } which is now ${
      updateTodoInput.isCompleted ? 'completed' : 'not completed'
    }`;
  }

  remove(id: string) {
    return `This action removes a #${id} todo`;
  }
}
