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

class TodoInsertResult extends InsertResult {
  raw: { id: string }[];
}

class TodoUpdateResult extends UpdateResult {
  raw: { id: string }[];
}

@EntityRepository(Todo)
export class TodoRepository extends Repository<Todo> {
  async findTodoById(id: string): Promise<Todo | undefined> {
    return this.createQueryBuilder('todo')
      .where('todo.id = :id', { id })
      .getOne();
  }

  async findTodoByTitle(title: string): Promise<Todo | undefined> {
    return this.createQueryBuilder('todo')
      .where('todo.title = :title', { title })
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

  async findAllTodosByUserIdWithUser(id: string): Promise<Todo[]> {
    return this.createQueryBuilder('todo')
      .leftJoinAndSelect('todo.user', 'user')
      .where('todo.user.id = :id', { id })
      .getMany();
  }

  async createTodo(
    createTodoInput: CreateTodoInput,
    user: User,
  ): Promise<Todo> {
    const isTestEnv = process.env.NODE_ENV === 'test';
    // in this version, sqlite does not support RETURNING clause
    if (!isTestEnv) {
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
    return this.findTodoByTitle(createTodoInput.title) as Promise<Todo>;
  }

  async updateTodo(updateTodoInput: UpdateTodoInput): Promise<Todo> {
    const values: { id?: string } = { ...updateTodoInput };
    delete values.id;
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

  async removeTodo(id: string) {
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
}
