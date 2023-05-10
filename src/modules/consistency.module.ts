import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from 'src/schemas/transaction.schema';
import { ConsistencyService } from '../services/consistency.service';
import { MissingBlockConsumerService } from '../services/consumers/missingBlockConsumer.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Transaction.name, schema: TransactionSchema }]),
    BullModule.registerQueue({
      name: 'missing_blocks',
    }),
  ],
  controllers: [],
  providers: [ConsistencyService, MissingBlockConsumerService],
})
export class ConsistencyModule {
  // todo
  // fetch num of tx
  // fetch tx
  // make jobs for workers
}
