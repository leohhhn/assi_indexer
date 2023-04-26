import { ConflictException, Injectable } from '@nestjs/common';

import { Transaction } from './schemas/transaction.schema';
import { TransactionRepository } from './transaction.repository';

@Injectable()
export class TransactionService {
  constructor(
    private readonly transactionRepository: TransactionRepository
  ) {
  }

  async getTransactionById(txHash: string): Promise<Transaction> {
    return this.transactionRepository.findOne({ txHash });
  }

  async getTransactions(): Promise<Transaction[]> {
    return this.transactionRepository.find({ sort: { _id: -1 }, limit: 500 });
  }

  async getTransactionsFrom(from: string): Promise<Transaction[]> {
    return this.transactionRepository.find({ from: from });
  }

  async getTransactionsTo(to: string): Promise<Transaction[]> {
    return this.transactionRepository.find({ to: to });
  }

  async getTransactionsBetweenTimestamps(
    start: number,
    end: number
  ): Promise<Transaction[]> {
    return this.transactionRepository.find({
      timestamp: {
        $gte: start,
        $lte: end
      }
    });
  }

  async createTransactions(txs: Transaction[]): Promise<Transaction[]> {
    try {
      return this.transactionRepository.createMany(txs);
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException(
          `Found duplicate transaction, not inserting.`
        );
      } else {
        throw error;
      }
    }
  }

  async getTransactionsAtHeight(blockNumber: number): Promise<Transaction[]> {
    return await this.transactionRepository.find({ blockNumber });
  }

  async getTransactionsBetween(from: string, to: string): Promise<Transaction[]> {
    return await this.transactionRepository.find({ from: from, to: to });
  }
}
