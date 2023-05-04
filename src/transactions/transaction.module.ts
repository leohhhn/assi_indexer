import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { TransactionRepository } from './transaction.repository';
import { EthersService } from '../web3/ethers.service';
import { BlockJobProducerService } from './blockJobProducer.service';
import { BullModule } from '@nestjs/bull';
import { BlockConsumerService } from './blockConsumer.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Transaction.name, schema: TransactionSchema }]),
    BullModule.registerQueue({
      name: 'blocks',
    }),
  ],
  controllers: [TransactionController],
  providers: [
    TransactionService,
    TransactionRepository,
    EthersService,
    BlockJobProducerService,
    BlockConsumerService,
  ],
})
export class TransactionModule {}
