import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from 'todo/entities/todo.entity';
import { User } from '../entities/user.entity';
import { UserRepository } from './user.repository';

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<unknown>;
};

export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(
  () => ({}),
);

describe('UserRepository', () => {
  let repository: UserRepository;
  let entity: Repository<User>;

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
        TypeOrmModule.forFeature([User]),
      ],
      providers: [UserRepository],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    entity = module.get(getRepositoryToken(User));
  });

  afterEach(async () => {
    await entity.manager.connection.close();
  });

  it('repository should be defined', () => {
    expect(repository).toBeDefined();
  });
});
