import { Controller, Get, Param, Query } from '@nestjs/common';

import { Transaction } from './schemas/transaction.schema';
import { TransactionService } from './transaction.service';
import { EthersService } from '../web3/ethers.service';

@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly ethersService: EthersService
  ) {
  }

  // fetch by:
  // hash k
  // from k
  // to k
  // blockHeight all tx - effectively whole block k
  // to & from? k
  // specific timestamp k
  // between a range of timestamps k
  // tx value

  @Get('/blocks')
  async getIndexedBlocks(): Promise<number[]> {
    return await this.ethersService.getIndexedBlocks();
  }

  @Get('/block/:blockNumber')
  async getTransactionsAtHeight(@Param('blockNumber') blockNumber: number): Promise<Transaction[]> {
    return await this.transactionService.getTransactionsAtHeight(blockNumber);
  }

  @Get('/betweenTimestamps')
  async getTransactionsBetweenTimestamps(@Query() query: { start: number, end: number }): Promise<Transaction[]> {
    return await this.transactionService.getTransactionsBetweenTimestamps(
      query.start,
      query.end
    );
  }

  @Get('/between')
  async getTransactionsBetween(@Query() query: { from: string, to: string }): Promise<Transaction[]> {
    return await this.transactionService.getTransactionsBetween(
      query.from.toLowerCase(),
      query.to.toLowerCase()
    );
  }

  @Get('/from/:address')
  async getTransactionsFrom(
    @Param('address') from: string): Promise<Transaction[]> {
    return this.transactionService.getTransactionsFrom(from.toLowerCase());
  }

  @Get('/to/:address')
  async getTransactionsTo(
    @Param('address') to: string): Promise<Transaction[]> {
    return this.transactionService.getTransactionsTo(to.toLowerCase());
  }

  @Get()
  async getTransactions(): Promise<Transaction[]> {
    // todo implement get only last 500 tx
    return this.transactionService.getTransactions();
  }

  @Get(':txHash')
  async getTransaction(@Param('txHash') txHash: string): Promise<Transaction> {
    return this.transactionService.getTransactionById(txHash.toLowerCase());
  }



}
