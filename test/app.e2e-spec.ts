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

  let cookie: string;

  it('should register new user', () => {
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

  it('should login successfully', () => {
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

  it('should create a new todo', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: 'createTodo',
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
      });
  });

  it('should return all users with todos', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: 'getUsers',
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

  afterAll(async () => {
    await app.close();
  });
});
