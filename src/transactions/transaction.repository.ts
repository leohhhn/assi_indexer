import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import { FilterQuery, Model, QueryOptions } from 'mongoose';

@Injectable()
export class TransactionRepository {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
  ) {}

  async findOne(transactionFilterQuery: FilterQuery<Transaction>, options: QueryOptions): Promise<Transaction> {
    return this.transactionModel.findOne(transactionFilterQuery, null, options); // todo see what is projectionType
  }

  async find(transactionsFilterQuery: FilterQuery<Transaction>): Promise<Transaction[]> {
    return this.transactionModel.find(transactionsFilterQuery);
  }

  async create(tx: Transaction): Promise<Transaction> {
    const newTX = new this.transactionModel(tx);
    return await newTX.save();
  }

  async createMany(txs: Transaction[]) {
    try {
      const bulkOperations = txs.map(transaction => ({
        updateOne: {
          filter: { txHash: transaction.txHash },
          update: { $set: transaction },
          upsert: true,
        },
      }));

      await this.transactionModel.bulkWrite(bulkOperations);
    } catch (e) {
      throw new Error(e);
    }
  }
}
