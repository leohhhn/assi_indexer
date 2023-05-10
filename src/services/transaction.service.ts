import { ConflictException, Injectable } from '@nestjs/common';
import { Transaction } from '../schemas/transaction.schema';
import { TransactionRepository } from '../repos/transaction.repository';

@Injectable()
export class TransactionService {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async getTransactionById(txHash: string): Promise<Transaction> {
    return this.transactionRepository.findOne({ txHash }, {});
  }

  async getTransactions(): Promise<Transaction[]> {
    return this.transactionRepository.find({});
  }

  async getTransactionsFrom(from: string): Promise<Transaction[]> {
    return this.transactionRepository.find({ from: from });
  }

  async getTransactionsTo(to: string): Promise<Transaction[]> {
    return this.transactionRepository.find({ to: to });
  }

  async getTransactionsBetweenTimestamps(start: number, end: number): Promise<Transaction[]> {
    return this.transactionRepository.find({
      timestamp: {
        $gte: start,
        $lte: end,
      },
    });
  }

  async createTransactions(txs: Transaction[]) {
    try {
      this.transactionRepository.createMany(txs);
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException(`Found duplicate transaction, not inserting.`);
      } else {
        throw error;
      }
    }
  }

  async getTransactionsAtHeight(blockNumber: number): Promise<Transaction[]> {
    return await this.transactionRepository.find({ block: blockNumber });
  }

  async getTransactionsBetween(from: string, to: string): Promise<Transaction[]> {
    return await this.transactionRepository.find({ from: from, to: to });
  }

  async getLatestBlockInDB(): Promise<number> {
    const options = {
      sort: { block: -1 }, // Sort in descending order based on the "block" property
    };
    const tx = await this.transactionRepository.findOne({}, options);
    if (tx === null) return 0;
    return tx.block;
  }

  async getIndexedTXCount(): Promise<number> {
    return this.transactionRepository.fetchNumOfTX();
  }
}
