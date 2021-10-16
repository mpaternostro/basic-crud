import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTodoInput {
  @IsNotEmpty()
  @IsString()
  title: string;
}
