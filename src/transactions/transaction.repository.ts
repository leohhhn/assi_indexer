import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import { FilterQuery, Model } from 'mongoose';

@Injectable()
export class TransactionRepository {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>
  ) {
  }

  async findOne(
    transactionFilterQuery: FilterQuery<Transaction>
  ): Promise<Transaction> {
    return this.transactionModel.findOne(transactionFilterQuery);
  }

  async find(
    transactionsFilterQuery: FilterQuery<Transaction>
  ): Promise<Transaction[]> {
    return this.transactionModel.find(transactionsFilterQuery);
  }


  async create(tx: Transaction): Promise<Transaction> {
    const newTX = new this.transactionModel(tx);
    return await newTX.save();
  }

  async createMany(txs: Transaction[]) {
    try {
      return await this.transactionModel.insertMany(txs);
    } catch (e) {
      if (e.code === 11000) {
        throw new ConflictException('Found duplicate tx, skipping.');
      }
      throw e;
    }
  }
}
