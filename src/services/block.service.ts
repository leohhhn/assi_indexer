import { Injectable } from '@nestjs/common';

import { Block } from '../schemas/block.schema';
import { BlockRepository } from 'src/repos/block.repository';

@Injectable()
export class BlockService {
  constructor(private readonly blockRepository: BlockRepository) {}

  async getBlockByNumber(blockNumber: string): Promise<Block> {
    return this.blockRepository.findOne({ blockNumber }, {});
  }

  async getAllBlocks(): Promise<Block[]> {
    return this.blockRepository.find({}, null);
  }

  async getNumberOfIndexedBlocks(): Promise<number> {
    const num = await this.blockRepository.fetchNumOfBlocks();
    if (num <= 0) throw new Error(`Still no indexed block in DB`);
    return num;
  }

  async getLatest500Blocks(): Promise<Block[]> {
    return this.blockRepository.find(
      {},
      {
        sort: {
          blockNumber: -1,
        },
        limit: 500,
      },
    );
  }

  async getBlocksFrom(from: string): Promise<Block[]> {
    throw new Error('not implemented yet');
  }

  async getBlocksUpTo(to: string): Promise<Block[]> {
    throw new Error('not implemented yet');
  }

  async getBlocksBetween(from: string, to: string): Promise<Block[]> {
    throw new Error('not implemented yet');
  }

  async getLatestBlockInDB(): Promise<Block> {
    const options = {
      sort: { blockNumber: -1 },
    };
    const latestBlock = await this.blockRepository.findOne({}, options);
    if (latestBlock === null) throw new Error('No block found in DB');
    return latestBlock;
  }

  async createBlock(b: Block) {
    await this.blockRepository.create(b);
  }
}
