import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoModule } from 'todo/todo.module';
import { UserService } from './service/user.service';
import { UserResolver } from './resolver/user.resolver';
import { UserRepository } from './repository/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserRepository]), TodoModule],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
