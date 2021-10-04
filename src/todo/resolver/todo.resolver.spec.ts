import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from 'user/service/user.service';
import { UserRepository } from 'user/repository/user.repository';
import { Todo } from '../entities/todo.entity';
import { TodoService } from '../service/todo.service';
import { TodoRepository } from '../repository/todo.repository';
import { TodoResolver } from './todo.resolver';

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<unknown>;
};

export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(
  () => ({}),
);

describe('TodoResolver', () => {
  let resolver: TodoResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoResolver,
        TodoService,
        UserService,
        UserRepository,
        {
          provide: getRepositoryToken(Todo),
          useFactory: repositoryMockFactory,
        },
        TodoRepository,
      ],
    }).compile();

    resolver = module.get<TodoResolver>(TodoResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
