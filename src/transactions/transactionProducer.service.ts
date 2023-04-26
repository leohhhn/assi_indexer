import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { Transaction } from './schemas/transaction.schema';

@Injectable()
export class TransactionProducerService {
  constructor(@InjectQueue('tx-format-queue') private queue: Queue) {
  }

  async addTransactions(
   tx:Transaction
  ) {
    await this.queue.add('tx-format-job', {
      tx,
    });
  }
}