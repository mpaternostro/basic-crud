import { IsString, MinLength } from 'class-validator';

export class CreateUserInput {
  @IsString()
  @MinLength(5)
  username: string;

  @IsString()
  @MinLength(5)
  password: string;
}
