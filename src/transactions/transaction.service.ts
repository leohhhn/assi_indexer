import { ConflictException, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

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
    return this.transactionRepository.find({});
  }

  async createTransactions(txs: Transaction[]): Promise<Transaction[]> {
    return this.transactionRepository.createMany(txs);
  }

  async createTransaction(tx: Transaction): Promise<Transaction> {
    try {
      return await this.transactionRepository.create({
        txID: uuidv4(),
        ...tx
      });
    } catch (error) {
      if (error.code === 11000) {
        // Handle duplicate key error
        throw new ConflictException(
          `Transaction with txHash ${tx.txHash} already exists`
        );
      } else {
        // Handle other errors
        throw error;
      }
    }
  }
}
