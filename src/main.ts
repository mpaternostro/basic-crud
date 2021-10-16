import * as cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TrimPipe } from './trim.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new TrimPipe(), new ValidationPipe());
  app.use(cookieParser());
  await app.listen(3000);
}
bootstrap();
