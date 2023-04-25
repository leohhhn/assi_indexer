import { Controller, Get, Param } from '@nestjs/common';

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

  @Get('/balance/:address')
  async getETHBalance(@Param('address') address: string): Promise<string> {
    return this.ethersService.getETHBalance(address);
  }

  @Get('/blocks')
  async getIndexedBlocks(): Promise<number[]> {
    return await this.ethersService.getIndexedBlocks();
  }

  @Get()
  async getTransactions(): Promise<Transaction[]> {
    return this.transactionService.getTransactions();
  }

  @Get(':txHash')
  async getTransaction(@Param('txHash') txHash: string): Promise<Transaction> {
    return this.transactionService.getTransactionById(txHash);
  }
}
