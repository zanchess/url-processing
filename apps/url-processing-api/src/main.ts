import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';

import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import helmet from 'helmet';

dayjs.extend(utc);

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.APP_ENV_NAME === 'prod'
        ? ['log', 'error', 'warn']
        : ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const logger = new Logger('Bootstrap API');

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason);
  });
  process.on('uncaughtException', (reason) => {
    logger.error('Uncaught Exception:', reason);
  });

  app.enableCors({
    origin: true,
    methods: 'HEAD,GET,POST,PUT,PATCH,DELETE',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Url Processing API')
    .setDescription('')
    .setVersion('0.1')
    .addBearerAuth()
    .build();

  const options: SwaggerCustomOptions = {
    swaggerUiEnabled: process.env.APP_ENV_NAME !== 'prod',
  };
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, options);

  const port = Number(process.env.API_PORT ?? 3005);

  logger.log(`Starting the api app at ${port}`);
  await app.listen(port);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
