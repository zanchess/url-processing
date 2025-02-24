import { Injectable } from '@nestjs/common';
import { UrlProcessingRepository } from '@app/url-processing-shared/core/UrlProcessing/UrlProcessing.repository';
import { RequestStatus, UrlProcessing } from '@prisma/client';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class UrlProcessingService {
  constructor(
    private readonly urlProcessingRepository: UrlProcessingRepository,
    @InjectQueue('url-processing-queue')
    private readonly sendUrlToRequestQueue: Queue,
  ) {}

  private async addRequestsToQueueBulk(data: UrlProcessing[]) {
    const jobs = data.map((url) => ({
      name: 'send-request',
      data: { ...url },
      opts: {
        attempts: 5,
        removeOnComplete: {
          age: 3600,
        },
        removeOnFail: {
          age: 21600,
        },
        backoff: {
          type: 'exponential',
          delay: 3000,
        },
      },
    }));

    await this.sendUrlToRequestQueue.addBulk(jobs);
  }

  async sendUrlRequests() {
    const urls = await this.urlProcessingRepository.getUrlList(
      RequestStatus.NEW,
    );
    const apiUrlsToSend = await Promise.all(
      urls.map((url) =>
        this.urlProcessingRepository.updateUrl(url.id, {
          status: RequestStatus.PROCESSING,
        }),
      ),
    );
    await this.addRequestsToQueueBulk(apiUrlsToSend);

    return {
      success: true,
      message: 'UrlProcessing started success',
    };
  }
}
