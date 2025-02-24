import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { HttpModule } from '@nestjs/axios';
import { DatabaseModule } from '@app/url-processing-shared/database/database.module';
import { DatabaseService } from '@app/url-processing-shared/database/database.service';
import { RequestProcessor } from './processors/UrlProcessing.processor';
import { UrlProcessingModule } from '@app/url-processing-shared/core/UrlProcessing/UrlProcessing.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot({
      delimiter: ':',
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        password: process.env.REDIS_USER_PASSWORD,
        username: process.env.REDIS_USER,
        db: Number(process.env.REDIS_DB_QUEUE),
      },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          database: Number(process.env.REDIS_DB_CACHE),
          ttl: Number(process.env.CACHE_MANAGER_DEFAULT_TTL),
          socket: {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
          },
          password: process.env.REDIS_USER_PASSWORD,
          username: process.env.REDIS_USER,
        }),
      }),
    }),
    ClsModule.forRoot({
      plugins: [
        new ClsPluginTransactional({
          imports: [DatabaseModule],
          adapter: new TransactionalAdapterPrisma({
            prismaInjectionToken: DatabaseService,
          }),
        }),
      ],
      global: true,
      middleware: { mount: true },
    }),
    BullModule.registerQueue({
      name: 'url-processing-queue',
    }),
    HttpModule,
    UrlProcessingModule,
  ],
  providers: [RequestProcessor],
  controllers: [],
})
export class AppModule {}
