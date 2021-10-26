import {
  EntityRepository,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { User } from 'user/entities/user.entity';
import { CreateTodoInput } from '../dto/create-todo.input';
import { UpdateTodoInput } from '../dto/update-todo.input';
import { Todo } from '../entities/todo.entity';
import { TodoQueryValues } from '../TodoQueryValues.type';

class TodoInsertResult extends InsertResult {
  raw: { id: string }[];
}

class TodoUpdateResult extends UpdateResult {
  raw: { id: string }[];
}

@EntityRepository(Todo)
export class TodoRepository extends Repository<Todo> {
  // in this version sqlite does not support RETURNING clause
  private isTestEnv = process.env.NODE_ENV === 'test';

  async findTodo(queryValue: TodoQueryValues) {
    const queryByField = 'id' in queryValue ? 'id' : 'title';
    return this.createQueryBuilder('todo')
      .where(`todo.${queryByField} = :${queryByField}`, queryValue)
      .getOne();
  }

  // async findTodoById(id: string): Promise<Todo | undefined> {
  //   return this.createQueryBuilder('todo')
  //     .where('todo.id = :id', { id })
  //     .getOne();
  // }

  // async findTodoByTitle(title: string): Promise<Todo | undefined> {
  //   return this.createQueryBuilder('todo')
  //     .where('todo.title = :title', { title })
  //     .getOne();
  // }

  async findAllTodos(): Promise<Todo[]> {
    return this.createQueryBuilder('todo').getMany();
  }

  async findAllTodosByUserId(id: string): Promise<Todo[]> {
    return this.createQueryBuilder('todo')
      .where('todo.user.id = :id', { id })
      .getMany();
  }

  async createTodo(
    createTodoInput: CreateTodoInput,
    user: User,
  ): Promise<Todo> {
    if (!this.isTestEnv) {
      return this.createQueryBuilder('todo')
        .insert()
        .into(Todo)
        .values({
          ...createTodoInput,
          user,
        })
        .returning('*')
        .execute()
        .then((response: TodoInsertResult) => {
          return this.create(response.raw[0]);
        });
    }
    await this.createQueryBuilder('todo')
      .insert()
      .into(Todo)
      .values({
        ...createTodoInput,
        user,
      })
      .execute();
    return this.findTodo({ title: createTodoInput.title }) as Promise<Todo>;
  }

  async updateTodo(updateTodoInput: UpdateTodoInput): Promise<Todo> {
    const values: { id?: string } = { ...updateTodoInput };
    delete values.id;
    if (!this.isTestEnv) {
      return this.createQueryBuilder()
        .update(Todo)
        .set(values)
        .where('id = :id', { id: updateTodoInput.id })
        .returning('*')
        .execute()
        .then((response: TodoUpdateResult) => {
          return this.create(response.raw[0]);
        });
    }
    await this.createQueryBuilder()
      .update(Todo)
      .set(values)
      .where('id = :id', { id: updateTodoInput.id })
      .execute();
    return this.findTodo({ id: updateTodoInput.id }) as Promise<Todo>;
  }

  async removeTodo(id: string) {
    if (!this.isTestEnv) {
      return this.createQueryBuilder()
        .delete()
        .from(Todo)
        .where('id = :id', { id })
        .returning('*')
        .execute()
        .then((response) => {
          return response.raw[0];
        });
    }
    await this.createQueryBuilder()
      .delete()
      .from(Todo)
      .where('id = :id', { id })
      .execute();
    return this.findTodo({ id });
  }
}
