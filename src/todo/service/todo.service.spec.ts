import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateTodoInput } from 'todo/dto/create-todo.input';
import { UpdateTodoInput } from 'todo/dto/update-todo.input';
import { Todo } from 'todo/entities/todo.entity';
import { User } from 'user/entities/user.entity';
import { TodoRepository } from '../repository/todo.repository';
import { TodoService } from './todo.service';

describe('TodoService', () => {
  let todoService: TodoService;
  let todoRepository: TodoRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        {
          provide: TodoRepository,
          useValue: {
            findTodo: jest.fn().mockResolvedValue(new Todo()),
            findAllTodos: jest.fn().mockResolvedValue([new Todo()]),
            findAllTodosByUserId: jest.fn().mockResolvedValue([new Todo()]),
            createTodo: jest.fn().mockResolvedValue(new Todo()),
            updateTodo: jest.fn().mockResolvedValue(new Todo()),
            removeTodo: jest.fn().mockResolvedValue(new Todo()),
          },
        },
      ],
    }).compile();

    todoService = module.get<TodoService>(TodoService);
    todoRepository = module.get<TodoRepository>(TodoRepository);
  });

  it('should be defined', () => {
    expect(todoService).toBeDefined();
  });

  it('should return one todo by its id', async () => {
    expect(await todoService.findOne({ id: '1' })).toBeInstanceOf(Todo);
  });

  it("should throw if there's no todo with such id", async () => {
    jest.spyOn(todoRepository, 'findTodo').mockResolvedValue(undefined);
    await expect(todoService.findOne({ id: '2' })).rejects.toThrow(
      HttpException,
    );
  });

  it("should throw if there's no todo with such title", async () => {
    jest.spyOn(todoRepository, 'findTodo').mockResolvedValue(undefined);
    await expect(todoService.findOne({ title: 'test' })).rejects.toThrow(
      HttpException,
    );
  });

  it('should return all todos', async () => {
    expect(await todoService.findAll()).toHaveLength(1);
  });

  it("should return all user's todos", async () => {
    expect(await todoService.findAllByUserId('1')).toHaveLength(1);
  });

  it('should return new todo', async () => {
    const createTodoInput = new CreateTodoInput();
    createTodoInput.title = 'test';
    expect(
      await todoService.create(createTodoInput, new User()),
    ).toBeInstanceOf(Todo);
  });

  it('should return updated todo', async () => {
    const updateTodoInput = new UpdateTodoInput();
    updateTodoInput.title = 'test';
    expect(await todoService.update(updateTodoInput)).toBeInstanceOf(Todo);
  });

  it("should throw if there's no todo with such id to update", async () => {
    jest.spyOn(todoRepository, 'updateTodo').mockResolvedValue(undefined);
    const updateTodoInput = new UpdateTodoInput();
    updateTodoInput.title = 'test';
    await expect(todoService.update(updateTodoInput)).rejects.toThrow(
      HttpException,
    );
  });

  it('should return removed todo', async () => {
    expect(await todoService.remove('1')).toBeInstanceOf(Todo);
  });

  it("should throw if there's no todo with such id to remove", async () => {
    jest.spyOn(todoRepository, 'removeTodo').mockResolvedValue(undefined);
    await expect(todoService.remove('1')).rejects.toThrow(HttpException);
  });
});
