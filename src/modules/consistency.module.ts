import { BullModule } from '@nestjs/bull';
import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from 'src/schemas/transaction.schema';
import { ConsistencyService } from '../services/consistency.service';
import { MissingBlockConsumerService } from '../services/consumers/missingBlockConsumer.service';
import { BlockService } from 'src/services/block.service';
import { BlockModule } from './block.module';

@Module({
  imports: [
    BlockModule,
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      // { name: Block.name, schema: BlockSchema }, // should this be here?
    ]),
    BullModule.registerQueue({
      name: 'missing_blocks',
    }),
  ],
  controllers: [],
  providers: [ConsistencyService, MissingBlockConsumerService],
  // blockservice is null for some reason
})
export class ConsistencyModule {}
