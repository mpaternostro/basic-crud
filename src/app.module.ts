import { join } from 'path';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from 'user/user.module';
import { TodoModule } from 'todo/todo.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DateScalar } from './date-scalar';

@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot({
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
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: ['dist/**/*.entity{.ts,.js}'],
      autoLoadEntities: true,
      // synchronize: true,
      ssl: {
        rejectUnauthorized: false,
      },
    }),
    UserModule,
    TodoModule,
  ],
  controllers: [AppController],
  providers: [AppService, DateScalar],
})
export class AppModule {}
