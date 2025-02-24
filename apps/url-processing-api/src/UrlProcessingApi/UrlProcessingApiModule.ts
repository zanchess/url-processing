import { Module } from '@nestjs/common';
import { UrlProcessingApiController } from './UrlProcessingApi.controller';
import { UrlProcessingModule } from '@app/url-processing-shared/core/UrlProcessing/UrlProcessing.module';

@Module({
  controllers: [UrlProcessingApiController],
  imports: [UrlProcessingModule],
  providers: [],
})
export class UrlProcessingApiModule {}
