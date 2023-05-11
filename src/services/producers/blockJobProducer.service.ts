import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { BlockWithTransactions } from 'zksync-web3/build/src/types';

@Injectable()
export class BlockJobProducerService {
  constructor(@InjectQueue('blocks_queue') private queue: Queue) {}

  async addBlockJob(blockToProcess: BlockWithTransactions) {
    await this.queue.add('block_job', blockToProcess, { jobId: blockToProcess.number });
  }
}
