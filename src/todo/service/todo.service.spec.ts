import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from 'user/service/user.service';
import { UserRepository } from 'user/repository/user.repository';
import { Todo } from '../entities/todo.entity';
import { TodoResolver } from '../resolver/todo.resolver';
import { TodoService } from './todo.service';
import { TodoRepository } from '../repository/todo.repository';

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<unknown>;
};

export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(
  () => ({}),
);

describe('TodoService', () => {
  let service: TodoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoResolver,
        TodoService,
        UserService,
        ConfigService,
        UserRepository,
        {
          provide: getRepositoryToken(Todo),
          useFactory: repositoryMockFactory,
        },
        TodoRepository,
      ],
    }).compile();

    service = module.get<TodoService>(TodoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
