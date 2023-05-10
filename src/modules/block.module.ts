import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlockRepository } from 'src/repos/block.repository';
import { Block, BlockSchema } from 'src/schemas/block.schema';
import { BlockService } from 'src/services/block.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Block.name, schema: BlockSchema }])],
  controllers: [],
  providers: [BlockRepository, BlockService],
})
export class BlockModule {}
