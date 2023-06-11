import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ethers } from 'ethers';
import { Provider } from 'zksync-web3';
import { Logger } from '@nestjs/common';
import { Transaction } from 'src/schemas/transaction.schema';

@Processor('missing_blocks')
export class MissingBlockConsumerService {
  @Process({ name: 'transaction_bulk', concurrency: 10 })
  async doJob(job: Job<Array<Transaction>>) {}

  async getProvider(): Promise<Provider> {
    const provider = new Provider('https://mainnet.era.zksync.io');
    return provider;
  }
}

// total num of blocks - blocks in collection
//
// 1000 blocks
// 500 minus the missing blocks
//
