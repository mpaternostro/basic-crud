import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from 'todo/entities/todo.entity';
import { UserRepository } from './user.repository';
import { User } from '../entities/user.entity';
import { CreateUserInput } from '../dto/create-user.input';
import { UpdateUserRefreshTokenInput } from '../dto/update-user-refresh-token.input';

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<unknown>;
};

export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(
  () => ({}),
);

describe('UserRepository', () => {
  let repository: UserRepository;
  let entity: Repository<User>;
  let newUser: User;

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

    entity = module.get(getRepositoryToken(User));
    repository = entity.manager.connection.getCustomRepository(UserRepository);

    // create a new user in db and save user in variable
    const createUserInput = new CreateUserInput();
    createUserInput.username = 'tester';
    createUserInput.password = 'newpassword';
    newUser = await repository.createUser(createUserInput);
  });

  afterEach(async () => {
    await entity.manager.connection.close();
  });

  it('repository should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should find a user by id and/or username', async () => {
    expect(await repository.findUser({ id: newUser.id })).toHaveProperty(
      'username',
      'tester',
    );
    expect(
      await repository.findUser({ username: newUser.username }),
    ).toHaveProperty('username', 'tester');
  });

  it('should find a user by id and/or username with password field included', async () => {
    expect(
      await repository.findUserWithPassword({ id: newUser.id }),
    ).toHaveProperty('password', 'newpassword');
    expect(
      await repository.findUserWithPassword({ username: newUser.username }),
    ).toHaveProperty('password', 'newpassword');
  });

  it('should find all users', async () => {
    expect(await repository.findAllUsers()).toHaveLength(1);
  });

  it('should create a new user', async () => {
    const createUserInput = new CreateUserInput();
    createUserInput.username = 'newtester';
    createUserInput.password = 'newpassword';
    expect(await repository.createUser(createUserInput)).toHaveProperty(
      'username',
      'newtester',
    );
  });

  it('should update user', async () => {
    expect(
      await repository.updateUser({
        id: newUser.id,
        currentPassword: 'newpassword',
        username: 'newusername',
      }),
    ).toHaveProperty('username', 'newusername');
  });

  it('should update user refresh token', async () => {
    const updateUserRefreshTokenInput = new UpdateUserRefreshTokenInput();
    updateUserRefreshTokenInput.id = newUser.id;
    updateUserRefreshTokenInput.hashedRefreshToken = 'newhashedrefreshtoken';
    expect(
      await repository.updateUserRefreshToken(updateUserRefreshTokenInput),
    ).toHaveProperty(
      'currentHashedRefreshToken',
      updateUserRefreshTokenInput.hashedRefreshToken,
    );
  });

  it('should remove user', async () => {
    expect(await repository.removeUser(newUser.id)).toHaveProperty(
      'id',
      newUser.id,
    );
  });
});
