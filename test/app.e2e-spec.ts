import { join } from 'path';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import * as Joi from 'joi';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { User } from 'user/entities/user.entity';
import { Todo } from 'todo/entities/todo.entity';
import { UserModule } from 'user/user.module';
import { TodoModule } from 'todo/todo.module';
import { AuthModule } from 'auth/auth.module';
import { DateScalar } from '../src/date-scalar';
import { TrimPipe } from '../src/trim.pipe';

describe('User', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          validationSchema: Joi.object({
            NODE_ENV: Joi.string()
              .valid('development', 'production', 'test', 'provision')
              .default('development'),
            DATABASE_URL: Joi.string().required(),
            JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
            JWT_ACCESS_TOKEN_EXPIRATION_TIME: Joi.string().required(),
            JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
            JWT_REFRESH_TOKEN_EXPIRATION_TIME: Joi.string().required(),
            PASSWORD_SALT: Joi.number().required(),
          }),
        }),
        GraphQLModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: () => ({
            typePaths: ['./**/*.graphql'],
            definitions: {
              path: join(process.cwd(), 'src/graphql.ts'),
              outputAs: 'class',
              defaultScalarType: 'unknown',
              customScalarTypeMapping: {
                DateTime: 'Date',
              },
            },
          }),
        }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User, Todo],
          synchronize: true,
          autoLoadEntities: true,
          keepConnectionAlive: false,
        }),
        UserModule,
        TodoModule,
        AuthModule,
      ],
      providers: [DateScalar],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new TrimPipe(), new ValidationPipe());
    app.use(cookieParser());
    await app.init();
  });

  let cookie = '';
  let someUserId = '';
  let someTodoId = '';

  it('should register new user [/auth/register]', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        username: 'tester',
        password: 'newpassword',
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201);
  });

  it('should login successfully [/auth/login]', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'tester',
        password: 'newpassword',
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(200)
      .expect((response) => {
        cookie = response.headers['set-cookie'];
      });
  });

  it('should fetch current user [whoAmI]', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `query whoami {
          whoAmI {
            id
            username
            password
            createdAt
            updatedAt
            todos {
              id
              title
              isCompleted
              createdAt
              updatedAt
            }
          }
        }`,
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Cookie', cookie)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.whoAmI).toHaveProperty('id');
        someUserId = response.body.data.whoAmI.id;
      });
  });

  it('should fetch a single user [getUser]', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `query getUser($id: ID!) {
          user(id: $id) {
            id
            username
            createdAt
            updatedAt
            todos {
              id
              title
              isCompleted
            }
          }
        }`,
        variables: {
          id: someUserId,
        },
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Cookie', cookie)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.user).toHaveProperty('id');
      });
  });

  it("should update user's username and password [updateUser]", () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation updateUser($user: UpdateUserInput!) {
          updateUser(updateUserInput: $user) {
            id
            username
            createdAt
            updatedAt
          }
        }`,
        variables: {
          user: {
            id: someUserId,
            username: 'updatedTester',
            currentPassword: 'newpassword',
            password: 'newsecurepassword',
          },
        },
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Cookie', cookie)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.updateUser).toHaveProperty('id');
        expect(response.body.data.updateUser).toHaveProperty(
          'username',
          'updatedTester',
        );
        cookie = response.headers['set-cookie'];
      });
  });

  it('should login successfully with new credentials [/auth/login]', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'updatedTester',
        password: 'newsecurepassword',
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(200)
      .expect((response) => {
        cookie = response.headers['set-cookie'];
      });
  });

  it('should create a new todo [/createTodo]', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation createTodo($todo: CreateTodoInput!) {
          createTodo(createTodoInput: $todo) {
            id
            title
            isCompleted
            user {
              id
              username
            }
          }
        }`,
        variables: {
          todo: {
            title: 'Todo test',
          },
        },
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Cookie', cookie)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.createTodo).toHaveProperty('id');
        someTodoId = response.body.data.createTodo.id;
      });
  });

  it('should create and delete a new user [/auth/register & removeUser]', () => {
    let someNewUserId = '';
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        username: 'testertobedeleted',
        password: 'newpassword',
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201)
      .then((response) => {
        someNewUserId = response.body.id;
        return request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: `mutation removeUser($user: RemoveUserInput!) {
              removeUser(removeUserInput: $user) {
                id
                username
                createdAt
                updatedAt
              }
            }`,
            variables: {
              user: {
                id: someNewUserId,
                currentPassword: 'newpassword',
              },
            },
          })
          .set('Content-Type', 'application/json')
          .set('Accept', 'application/json')
          .set('Cookie', cookie)
          .expect(200)
          .expect((response) => {
            expect(response.body.data.removeUser).toHaveProperty('id');
            expect(response.body.data.removeUser).toHaveProperty(
              'username',
              'testertobedeleted',
            );
          });
      });
  });

  it('should return all users with todos [getUsers]', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `query getUsers {
          users {
            id
            username
            password
            createdAt
            updatedAt
            todos {
              id
              title
              isCompleted
            }
          }
        }`,
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Cookie', cookie)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.users).toHaveLength(1);
        expect(response.body.data.users[0].todos).toHaveLength(1);
      });
  });

  it('should update some todo [updateTodo]', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation updateTodo($todo: UpdateTodoInput!) {
          updateTodo(updateTodoInput: $todo) {
            id
            title
            isCompleted
            user {
              id
            }
          }
        }`,
        variables: {
          todo: {
            id: someTodoId,
            title: '  Updated todo test  ',
          },
        },
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Cookie', cookie)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.updateTodo).toHaveProperty('id');
        expect(response.body.data.updateTodo).toHaveProperty(
          'title',
          'Updated todo test',
        );
      });
  });

  it('should get some todo [getTodo]', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `query getTodo($id: ID!) {
          todo(id: $id) {
            id
            title
            isCompleted
            user {
              id
            }
          }
        }`,
        variables: {
          id: someTodoId,
        },
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Cookie', cookie)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.todo).toHaveProperty('id');
        expect(response.body.data.todo).toHaveProperty(
          'title',
          'Updated todo test',
        );
        expect(response.body.data.todo.user).toHaveProperty('id', someUserId);
      });
  });

  it('should delete some todo [/removeTodo]', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation removeTodo($id: ID!) {
          removeTodo(id: $id) {
            id
            title
            isCompleted
          }
        }`,
        variables: {
          id: someTodoId,
        },
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Cookie', cookie)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.removeTodo).toHaveProperty('id');
        expect(response.body.data.removeTodo).toHaveProperty(
          'title',
          'Updated todo test',
        );
      });
  });

  it('should get all todos [getTodos]', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `query getTodos {
          todos {
            id
            title
            isCompleted
            user {
              id
              username
              password
              currentHashedRefreshToken
              createdAt
              updatedAt
            }
          }
        }`,
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Cookie', cookie)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.todos).toHaveLength(0);
      });
  });

  it('should refresh access token [/auth/refresh]', () => {
    return request(app.getHttpServer())
      .get('/auth/refresh')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Cookie', cookie)
      .expect(200)
      .expect((response) => {
        expect(response.body).toHaveProperty('id');
        cookie = response.headers['set-cookie'];
      });
  });

  it('should logout successfully [/auth/logout]', () => {
    return request(app.getHttpServer())
      .post('/auth/logout')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Cookie', cookie)
      .expect(200)
      .expect((response) => {
        cookie = response.headers['set-cookie'];
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
