import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RemoveUserInput {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsString()
  @MinLength(8)
  currentPassword: string;
}
