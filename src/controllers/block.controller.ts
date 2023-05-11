import { Controller, Get, Param, Query } from '@nestjs/common';
import { Block } from 'src/schemas/block.schema';
import { BlockService } from 'src/services/block.service';

@Controller('blocks')
export class BlockController {
  constructor(private readonly blockService: BlockService) {}

  @Get('/count')
  async getNumberOfBlocks(): Promise<number> {
    return this.blockService.getNumberOfIndexedBlocks();
  }

  @Get()
  async getBlocks(): Promise<Block[]> {
    return this.blockService.getLatest500Blocks();
  }
}
