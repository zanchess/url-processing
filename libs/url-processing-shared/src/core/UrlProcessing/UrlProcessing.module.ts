import { Module } from '@nestjs/common';
import { UrlProcessingRepository } from '@app/url-processing-shared/core/UrlProcessing/UrlProcessing.repository';
import { UrlProcessingService } from '@app/url-processing-shared/core/UrlProcessing/UrlProcessing.service';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'url-processing-queue',
    }),
  ],
  providers: [UrlProcessingRepository, UrlProcessingService],
  exports: [UrlProcessingRepository, UrlProcessingService],
  controllers: [],
})
export class UrlProcessingModule {}
