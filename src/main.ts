import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { json, urlencoded } from 'express';

import { AppModule } from './app.module';
import { setupSwagger } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });
  const configService = app.get(ConfigService);
  const inputLimit = configService.get<string>('INPUT_LIMIT');

  app.use(json({ limit: inputLimit }));
  app.use(urlencoded({ extended: true, limit: inputLimit }));

  setupSwagger(app);

  const port = configService.get<number>('PORT') as number;
  await app.listen(port);
  Logger.log(`Application is running on: http://localhost:${port}`);
  Logger.log(`Swagger documentation: http://localhost:${port}/docs`);
}

bootstrap();
