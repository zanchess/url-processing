import { Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { DatabaseModule } from '@app/url-processing-shared/database/database.module';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { DatabaseService } from '@app/url-processing-shared/database/database.service';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bullmq';
import { UrlProcessingApiModule } from './UrlProcessingApi/UrlProcessingApiModule';

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
    UrlProcessingApiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
