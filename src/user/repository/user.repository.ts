import {
  EntityRepository,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { CreateUserInput } from '../dto/create-user.input';
import { UpdateUserInput } from '../dto/update-user.input';
import { updateUserRefreshTokenInput } from '../dto/update-user-refresh-token.input';
import { User } from '../entities/user.entity';

class UserInsertResult extends InsertResult {
  raw: { id: string }[];
}

class UserUpdateResult extends UpdateResult {
  raw: { id: string }[];
}

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  // in this version sqlite does not support RETURNING clause
  private isTestEnv = process.env.NODE_ENV === 'test';

  async findUser(id: string) {
    return this.createQueryBuilder('user')
      .where('user.id = :id', { id })
      .getOne();
  }

  async findUserById(id: string) {
    return this.createQueryBuilder('user')
      .where('user.id = :id', { id })
      .getOne();
  }

  async findUserByUsername(username: string) {
    return this.createQueryBuilder('user')
      .where('user.username = :username', { username })
      .getOne();
  }

  async findUserByUsernameWithPassword(username: string) {
    return this.createQueryBuilder('user')
      .where('user.username = :username', { username })
      .addSelect('user.password')
      .getOne();
  }

  async findAllUsers() {
    return this.createQueryBuilder('user').getMany();
  }

  async createUser(createUserInput: CreateUserInput) {
    if (!this.isTestEnv) {
      return this.createQueryBuilder('user')
        .insert()
        .into(User)
        .values(createUserInput)
        .returning('*')
        .execute()
        .then((response: UserInsertResult) => {
          return this.create(response.raw[0]);
        });
    }
    await this.createQueryBuilder('user')
      .insert()
      .into(User)
      .values(createUserInput)
      .execute();
    return this.findUserByUsername(createUserInput.username) as Promise<User>;
  }

  async updateUser(updateUserInput: UpdateUserInput) {
    const values: { id?: string } = { ...updateUserInput };
    delete values.id;
    if (!this.isTestEnv) {
      return this.createQueryBuilder()
        .update(User)
        .set(values)
        .where('id = :id', { id: updateUserInput.id })
        .returning('*')
        .execute()
        .then((response: UserUpdateResult) => {
          if (response.raw[0]) {
            return this.create(response.raw[0]);
          }
          return;
        });
    }
    await this.createQueryBuilder()
      .update(User)
      .set(values)
      .where('id = :id', { id: updateUserInput.id })
      .execute();
    return this.findUserById(updateUserInput.id);
  }

  async updateUserRefreshToken(
    updateUserRefreshTokenInput: updateUserRefreshTokenInput,
  ) {
    const { id, hashedRefreshToken } = updateUserRefreshTokenInput;
    if (!this.isTestEnv) {
      return this.createQueryBuilder()
        .update(User)
        .set({
          currentHashedRefreshToken: hashedRefreshToken,
        })
        .where('id = :id', { id })
        .returning('*')
        .execute()
        .then((response: UserUpdateResult) => {
          if (response.raw[0]) {
            return this.create(response.raw[0]);
          }
          return;
        });
    }
    await this.createQueryBuilder()
      .update(User)
      .set({
        currentHashedRefreshToken: hashedRefreshToken,
      })
      .where('id = :id', { id })
      .execute();
    return this.findUserById(updateUserRefreshTokenInput.id);
  }

  async removeUser(id: string) {
    if (!this.isTestEnv) {
      return this.createQueryBuilder()
        .delete()
        .from(User)
        .where('id = :id', { id })
        .returning('*')
        .execute()
        .then((response) => {
          if (response.raw[0]) {
            return response.raw[0];
          }
          return;
        });
    }
    await this.createQueryBuilder()
      .delete()
      .from(User)
      .where('id = :id', { id })
      .execute();
    return this.findUserById(id);
  }
}
