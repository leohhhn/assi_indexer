import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, QueryOptions } from 'mongoose';
import { Block, BlockDocument } from 'src/schemas/block.schema';

@Injectable()
export class BlockRepository {
  constructor(
    @InjectModel(Block.name)
    private blockModel: Model<BlockDocument>,
  ) {}

  async findOne(blockFilterQuery: FilterQuery<Block>, options: QueryOptions): Promise<Block> {
    return this.blockModel.findOne(blockFilterQuery, null, options);
  }

  async find(blockFilterQuery: FilterQuery<Block>): Promise<Block[]> {
    return this.blockModel.find(blockFilterQuery);
  }

  async create(b: Block): Promise<Block> {
    const newBlock = new this.blockModel(b);
    return await newBlock.save();
  }

  async fetchNumOfBlocks(): Promise<number> {
    return await this.blockModel.countDocuments({});
  }
}
