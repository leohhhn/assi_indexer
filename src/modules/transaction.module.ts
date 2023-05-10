import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from '../schemas/transaction.schema';
import { TransactionService } from '../services/transaction.service';
import { TransactionRepository } from '../repos/transaction.repository';
import { EthersService } from '../services/ethers.service';
import { BlockJobProducerService } from '../services/producers/blockJobProducer.service';
import { BullModule } from '@nestjs/bull';
import { BlockConsumerService } from '../services/consumers/blockConsumer.service';
import { TransactionController } from 'src/controllers/transaction.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Transaction.name, schema: TransactionSchema }]),
    BullModule.registerQueue({
      name: 'blocks_queue',
    }),
  ],
  controllers: [TransactionController],
  providers: [
    TransactionRepository,
    TransactionService,
    EthersService,
    BlockJobProducerService,
    BlockConsumerService,
  ],
})
export class TransactionModule {}
