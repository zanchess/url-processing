import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { assertUnreachable } from '@app/url-processing-shared/utils';
import { RequestStatus, UrlProcessing } from '@prisma/client';
import axios from 'axios';
import { UrlProcessingRepository } from '@app/url-processing-shared/core/UrlProcessing/UrlProcessing.repository';

@Processor('url-processing-queue', {
  limiter: { max: 10, duration: 1000 },
  concurrency: 5,
})
export class UrlRequestProcessor extends WorkerHost {
  private readonly logger = new Logger(UrlRequestProcessor.name);

  constructor(
    private readonly urlProcessingRepository: UrlProcessingRepository,
  ) {
    super();
  }

  async process(job: Job<any, any, 'send-request'>): Promise<boolean> {
    const { name } = job;
    this.logger.debug(`Start of ${name} process`);

    if (name === 'send-request') {
      const data = job.data as UrlProcessing;
      const { url, id } = data;
      try {
        const response = await axios.get(url, { timeout: 5000 });
        await this.urlProcessingRepository.updateUrl(id, {
          status: RequestStatus.DONE,
          httpCode: response.status,
        });

        this.logger.debug(
          `URL ${url} processed with status ${response.status}`,
        );
      } catch (error) {
        let httpCode = 0;
        if (axios.isAxiosError(error) && error.response) {
          httpCode = error.response.status;
        }

        this.logger.error(`Error processing URL ${url}: ${error.message}`);

        await this.urlProcessingRepository.updateUrl(id, {
          status: RequestStatus.ERROR,
          httpCode: httpCode,
        });
      }
    } else {
      assertUnreachable(name);
    }

    this.logger.debug(`End of ${name} process`);
    return true;
  }
}
