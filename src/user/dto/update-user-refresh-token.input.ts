import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserRefreshTokenInput {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  hashedRefreshToken: string | null;
}
