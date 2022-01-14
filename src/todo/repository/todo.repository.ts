import {
  DeleteResult,
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

class TodoDeleteResult extends DeleteResult {
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

  async updateTodo(
    updateTodoInput: UpdateTodoInput,
  ): Promise<Todo | undefined> {
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
          if (response.raw[0]) {
            return this.create(response.raw[0]);
          }
          return;
        });
    }
    await this.createQueryBuilder()
      .update(Todo)
      .set(values)
      .where('id = :id', { id: updateTodoInput.id })
      .execute();
    return this.findTodo({ id: updateTodoInput.id });
  }

  async removeTodo(id: string) {
    if (!this.isTestEnv) {
      return this.createQueryBuilder()
        .delete()
        .from(Todo)
        .where('id = :id', { id })
        .returning('*')
        .execute()
        .then((response: TodoDeleteResult) => {
          if (response.raw[0]) {
            return this.create(response.raw[0]);
          }
          return;
        });
    }
    const todo = await this.findTodo({ id });
    await this.createQueryBuilder()
      .delete()
      .from(Todo)
      .where('id = :id', { id })
      .execute();
    return todo;
  }
}
