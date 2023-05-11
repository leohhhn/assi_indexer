import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlockController } from 'src/controllers/block.controller';
import { BlockRepository } from 'src/repos/block.repository';
import { Block, BlockSchema } from 'src/schemas/block.schema';
import { BlockService } from 'src/services/block.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Block.name, schema: BlockSchema }])],
  controllers: [BlockController],
  providers: [BlockRepository, BlockService],
  exports: [BlockService, BlockRepository],
})
export class BlockModule {}
