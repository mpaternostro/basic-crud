import { Test, TestingModule } from '@nestjs/testing';
import { CreateTodoInput } from 'todo/dto/create-todo.input';
import { UpdateTodoInput } from 'todo/dto/update-todo.input';
import { User } from 'user/entities/user.entity';
import { Todo } from '../entities/todo.entity';
import { TodoService } from '../service/todo.service';
import { TodoResolver } from './todo.resolver';

describe('TodoResolver', () => {
  let todoResolver: TodoResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoResolver,
        {
          provide: TodoService,
          useValue: {
            findOne: jest.fn().mockResolvedValue(new Todo()),
            findAllByUserId: jest.fn().mockResolvedValue([new Todo()]),
            create: jest.fn().mockResolvedValue(new Todo()),
            update: jest.fn().mockResolvedValue(new Todo()),
            remove: jest.fn().mockResolvedValue(new Todo()),
          },
        },
      ],
    }).compile();

    todoResolver = module.get<TodoResolver>(TodoResolver);
  });

  it('should be defined', () => {
    expect(todoResolver).toBeDefined();
  });

  it('should return one todo by its id', async () => {
    expect(await todoResolver.findOne('1')).toBeInstanceOf(Todo);
  });

  it('should return all todos', async () => {
    expect(await todoResolver.findAll(new User())).toHaveLength(1);
  });

  it('should return current user', async () => {
    expect(await todoResolver.findUser(new Todo(), new User())).toBeInstanceOf(
      User,
    );
  });

  it('should return new todo', async () => {
    const createTodoInput = new CreateTodoInput();
    createTodoInput.title = 'test';
    expect(
      await todoResolver.create(createTodoInput, new User()),
    ).toBeInstanceOf(Todo);
  });

  it('should return updated user', async () => {
    const updateTodoInput = new UpdateTodoInput();
    updateTodoInput.title = 'test';
    expect(await todoResolver.update(updateTodoInput)).toBeInstanceOf(Todo);
  });

  it('should return removed user', async () => {
    expect(await todoResolver.remove('1')).toBeInstanceOf(Todo);
  });
});
