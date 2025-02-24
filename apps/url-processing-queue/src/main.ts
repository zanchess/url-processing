import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bullmq';
import { createBullBoard } from '@bull-board/api';
import * as expressBasicAuth from 'express-basic-auth';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { Logger, ValidationPipe } from '@nestjs/common';

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

  app.enableCors({
    origin: true,
    methods: 'HEAD,GET,POST,PUT,PATCH,DELETE',
    credentials: true,
  });

  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  const queues = ['url-processing-queue'].map((q) =>
    app.get<Queue>(`BullQueue_${q}`),
  );

  createBullBoard({
    queues: queues.map((q) => new BullMQAdapter(q)),
    serverAdapter,
  });

  app.use(
    `/admin/queues`,
    expressBasicAuth({
      users: {
        ...(process.env.ADMIN_QUEUES_USER && {
          [process.env.ADMIN_QUEUES_USER]: process.env.ADMIN_QUEUES_PASSWORD!,
        }),
      },
      challenge: true,
    }),
    serverAdapter.getRouter(),
  );

  const logger = new Logger('Bootstrap Queue');

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason);
  });
  process.on('uncaughtException', (reason) => {
    logger.error('Uncaught Exception:', reason);
  });

  const port = Number(process.env.QUEUE_PORT ?? 3008);

  logger.log(`Starting the queue app at ${port}`);
  await app.listen(port);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
