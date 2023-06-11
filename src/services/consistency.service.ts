import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bull';
import { displayIndexingProgress, snapshotBlockNumber } from 'src/config';
import { getProvider } from 'src/helpers/helpers';
import { BlockService } from './block.service';

@Injectable()
export class ConsistencyService implements OnModuleInit {
  private readonly logger = new Logger(`Consistency Module`);

  constructor(private readonly blockService: BlockService, @InjectQueue('missing_blocks') private queue: Queue) {}

  async onModuleInit() {
    if (displayIndexingProgress) {
      setInterval(this.checkConsistency, 500);
    }
  }

  async checkConsistency() {
    const provider = await getProvider();
    const indexedBlocks = await this.blockService.getNumberOfIndexedBlocks();
    const latestBlockToIndex = snapshotBlockNumber === -1 ? await provider.getBlockNumber() : snapshotBlockNumber;

    this.showProgressBar(latestBlockToIndex, indexedBlocks);
  }

  async showProgressBar(totalBlocks: number, indexedBlocks: number) {
    // todo implement progress bar
    this.logger.log(`Indexing progress: ${(100 * indexedBlocks) / totalBlocks}%`);
  }

  // async processDBFetch() {}

  // todo think about the analytics part,
  // how to get every data piece and how to store it in the db for easier access
}
