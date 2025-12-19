import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
import { envs } from './config/envs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = new Logger(AppModule.name);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  )

  await app.listen(envs.port);
  logger.log(`Server running on port ${envs.port}`);
}
bootstrap();
