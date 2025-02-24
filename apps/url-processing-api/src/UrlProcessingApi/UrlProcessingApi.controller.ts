import { Controller, Post } from '@nestjs/common';
import { UrlProcessingService } from '@app/url-processing-shared/core/UrlProcessing/UrlProcessing.service';

@Controller('url-processing')
export class UrlProcessingApiController {
  constructor(private readonly urlProcessingService: UrlProcessingService) {}

  @Post('sendRequests')
  async sendUrlRequests() {
    return this.urlProcessingService.sendUrlRequests();
  }
}
