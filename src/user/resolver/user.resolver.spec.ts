import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from 'todo/entities/todo.entity';
import { TodoService } from 'todo/service/todo.service';
import { TodoRepository } from 'todo/repository/todo.repository';
import { UserService } from '../service/user.service';
import { UserRepository } from '../repository/user.repository';
import { User } from '../entities/user.entity';
import { UserResolver } from './user.resolver';
import { CreateUserInput } from '../dto/create-user.input';
import { UpdateUserInput } from '../dto/update-user.input';
import { Request } from 'express';
import { RemoveUserInput } from 'user/dto/remove-user.input';

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<unknown>;
};

export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(
  () => ({}),
);

describe('UserResolver', () => {
  let userResolver: UserResolver;
  let userService: UserService;
  let todoService: TodoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        UserService,
        TodoService,
        ConfigService,
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
        UserRepository,
        TodoRepository,
      ],
    }).compile();

    userResolver = module.get<UserResolver>(UserResolver);
    userService = module.get<UserService>(UserService);
    todoService = module.get<TodoService>(TodoService);
  });

  it('should be defined', () => {
    expect(userResolver).toBeDefined();
  });

  it('should return current user', () => {
    const expectedResult = new User();
    expect(userResolver.whoAmI(expectedResult)).toEqual(expectedResult);
  });

  it('should return a single user', async () => {
    const expectedResult = new User();
    const userTestId = '123';
    jest
      .spyOn(userService, 'findOne')
      .mockImplementation(() => Promise.resolve(expectedResult));
    expect(await userResolver.findOne(userTestId)).toEqual(expectedResult);
  });

  it('should return all users', async () => {
    const expectedResult = [new User()];
    jest
      .spyOn(userService, 'findAll')
      .mockImplementation(() => Promise.resolve(expectedResult));
    expect(await userResolver.findAll()).toEqual(expectedResult);
  });

  it('should return all todos', async () => {
    const expectedResult = [new Todo()];
    const someUser = new User();
    jest
      .spyOn(todoService, 'findAllByUserId')
      .mockImplementation(() => Promise.resolve(expectedResult));
    expect(await userResolver.findTodos(someUser)).toEqual(expectedResult);
  });

  it('should create a new user', async () => {
    const expectedResult = new User();
    const createUserInput = new CreateUserInput();
    jest
      .spyOn(userService, 'create')
      .mockImplementation(() => Promise.resolve(expectedResult));
    expect(await userResolver.create(createUserInput)).toEqual(expectedResult);
  });

  it('should update a user', async () => {
    const expectedResult = new User();
    const updateUserInput = new UpdateUserInput();
    const request = {
      res: {
        setHeader: jest.fn(),
      },
    } as any as Request;
    jest
      .spyOn(userService, 'update')
      .mockImplementation(() => Promise.resolve(expectedResult));
    expect(await userResolver.update(updateUserInput, request)).toEqual(
      expectedResult,
    );
  });

  it("should update a user's username and logout", async () => {
    const expectedResult = new User();
    const updateUserInput = new UpdateUserInput();
    const mockSetHeader = jest.fn();
    updateUserInput.username = 'tester';
    const request = {
      res: {
        setHeader: mockSetHeader,
      },
    } as any as Request;
    jest
      .spyOn(userService, 'update')
      .mockImplementation(() => Promise.resolve(expectedResult));
    expect(await userResolver.update(updateUserInput, request)).toEqual(
      expectedResult,
    );
    expect(mockSetHeader).toHaveBeenCalledTimes(1);
  });

  it("should update a user's username and fail to logout", async () => {
    const expectedResult = new User();
    const updateUserInput = new UpdateUserInput();
    updateUserInput.username = 'tester';
    const request = {} as any as Request;
    jest
      .spyOn(userService, 'update')
      .mockImplementation(() => Promise.resolve(expectedResult));
    expect(await userResolver.update(updateUserInput, request)).toEqual(
      expectedResult,
    );
  });

  it('should remove a user', async () => {
    const expectedResult = new User();
    const removeUserInput = new RemoveUserInput();
    jest
      .spyOn(userService, 'remove')
      .mockImplementation(() => Promise.resolve(expectedResult));
    expect(await userResolver.remove(removeUserInput)).toEqual(expectedResult);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
