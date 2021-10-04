import { CreateTodoInput } from './create-todo.input';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateTodoInput extends PartialType(CreateTodoInput) {
  id: string;
  isCompleted: boolean;
}
