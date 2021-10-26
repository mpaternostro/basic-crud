import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserInput {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsString()
  @MinLength(8)
  currentPassword: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}
