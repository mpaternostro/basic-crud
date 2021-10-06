import { IsNotEmpty, IsString } from 'class-validator';

export class updateUserRefreshTokenInput {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  hashedRefreshToken: string | null;
}
