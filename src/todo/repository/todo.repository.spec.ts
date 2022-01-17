import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { CreateTodoInput } from 'todo/dto/create-todo.input';
import { UpdateTodoInput } from 'todo/dto/update-todo.input';
import { Repository } from 'typeorm';
import { User } from 'user/entities/user.entity';
import { Todo } from '../entities/todo.entity';
import { TodoRepository } from './todo.repository';

describe('TodoRepository', () => {
  let repository: TodoRepository;
  let entity: Repository<Todo>;
  let newUser: User;
  let newTodo: Todo;

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
        TypeOrmModule.forFeature([User, Todo]),
      ],
      providers: [TodoRepository],
    }).compile();

    entity = module.get(getRepositoryToken(Todo));
    repository = entity.manager.connection.getCustomRepository(TodoRepository);

    // create a new test user
    newUser = new User();
    // create a new todo in db
    const createTodoInput = new CreateTodoInput();
    createTodoInput.title = 'test';
    newTodo = await repository.createTodo(createTodoInput, newUser);
  });

  afterEach(async () => {
    await entity.manager.connection.close();
  });

  it('repository should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should return todo by id', async () => {
    expect(await repository.findTodo({ id: newTodo.id })).toHaveProperty(
      'title',
      'test',
    );
  });

  it('should return todo by title', async () => {
    expect(await repository.findTodo({ title: newTodo.title })).toHaveProperty(
      'id',
      newTodo.id,
    );
  });

  it('should return all todos', async () => {
    expect(await repository.findAllTodos()).toHaveLength(1);
  });

  it('should return updated todo', async () => {
    const updateTodoInput = new UpdateTodoInput();
    updateTodoInput.id = newTodo.id;
    updateTodoInput.title = 'updated';
    expect(await repository.updateTodo(updateTodoInput)).toHaveProperty(
      'title',
      'updated',
    );
  });

  it('should return removed todo', async () => {
    expect(await repository.removeTodo(newTodo.id)).toBeInstanceOf(Todo);
  });
});
