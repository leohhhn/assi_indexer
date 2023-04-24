import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import { FilterQuery, Model } from 'mongoose';

@Injectable()
export class TransactionRepository {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
  ) {
  }

  async findOne(
    transactionFilterQuery: FilterQuery<Transaction>,
  ): Promise<Transaction> {
    return this.transactionModel.findOne(transactionFilterQuery);
  }

  async find(
    transactionsFilterQuery: FilterQuery<Transaction>,
  ): Promise<Transaction[]> {
    return this.transactionModel.findOne(transactionsFilterQuery);
  }

  async create(tx: Transaction): Promise<Transaction> {
    const newTX = new this.transactionModel(tx);
    return newTX.save();
  }
}
