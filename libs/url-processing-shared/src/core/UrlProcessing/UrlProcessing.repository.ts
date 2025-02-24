import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Prisma, RequestStatus } from '@prisma/client';

@Injectable()
export class UrlProcessingRepository {
  constructor(
    private readonly thHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  async updateUrl(id: number, updateData: Prisma.UrlProcessingUpdateInput) {
    return this.thHost.tx.urlProcessing.update({
      where: {
        id,
      },
      data: updateData,
    });
  }

  async getUrlList(type: RequestStatus) {
    return this.thHost.tx.urlProcessing.findMany({
      where: {
        status: type,
      },
    });
  }
}
