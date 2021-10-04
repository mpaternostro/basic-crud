import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'user/entities/user.entity';
import { Todo } from '../entities/todo.entity';
import { TodoRepository } from './todo.repository';

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<unknown>;
};

export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(
  () => ({}),
);

describe('TodoRepository', () => {
  let repository: TodoRepository;
  let entity: Repository<Todo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [User, Todo],
          synchronize: true,
          autoLoadEntities: true,
          keepConnectionAlive: false,
        }),
        TypeOrmModule.forFeature([Todo]),
      ],
      providers: [TodoRepository],
    }).compile();

    repository = module.get<TodoRepository>(TodoRepository);
    entity = module.get(getRepositoryToken(Todo));
  });

  afterEach(async () => {
    await entity.manager.connection.close();
  });

  it('repository should be defined', () => {
    expect(repository).toBeDefined();
  });
});
