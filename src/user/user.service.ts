import { Injectable } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';

@Injectable()
export class UserService {
  create(createUserInput: CreateUserInput) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOneById(id: string) {
    return `This action returns a #${id} user`;
  }

  update(updateUserInput: UpdateUserInput) {
    return `This action updates a #${updateUserInput.id} user with new username ${updateUserInput.username}`;
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
