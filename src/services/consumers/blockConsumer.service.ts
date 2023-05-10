import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ethers } from 'ethers';
import { BlockWithTransactions, TransactionReceipt } from 'zksync-web3/build/src/types';
import { Transaction } from '../../schemas/transaction.schema';
import { Provider } from 'zksync-web3';
import { Logger } from '@nestjs/common';
import { TransactionService } from '../transaction.service';

@Processor('blocks_queue')
export class BlockConsumerService {
  private readonly logger = new Logger(`${BlockConsumerService.name} ${process.pid}`);
  constructor(private readonly transactionService: TransactionService) {}

  @Process({ name: 'block_job', concurrency: 10 })
  async doJob(job: Job<BlockWithTransactions>) {
    try {
      const block = job.data;
      if (block.transactions.length == 0) return; // if empty block, nothing to index

      const provider = await this.getProvider();
      const finalTXs: Transaction[] = [];

      // fetch TX from API
      for (const tx of block.transactions) {
        const txReceipt: TransactionReceipt = await provider.getTransactionReceipt(tx.hash);
        const formattedTX = this.formatTX(tx, txReceipt, block.timestamp);
        finalTXs.push(formattedTX);
      }

      this.logger.error('Inserting ' + finalTXs.length + ' transactions from block ' + block.number + ' in DB.');
      await this.transactionService.createTransactions(finalTXs);
    } catch (error) {
      this.logger.error(error);
    }
  }

  formatTX(
    tx: ethers.providers.TransactionResponse,
    txReceipt: ethers.providers.TransactionReceipt,
    timestamp: number,
  ): Transaction {
    // in case of contract creation
    const from = txReceipt.from !== null ? txReceipt.from.toLowerCase() : '0x0';
    const to = txReceipt.to !== null ? txReceipt.to.toLowerCase() : '0x0';

    const formattedTx = new Transaction(
      txReceipt.transactionHash,
      timestamp,
      from,
      to,
      txReceipt.gasUsed.toString(),
      txReceipt.effectiveGasPrice.toString(),
      tx.gasLimit['hex'],
      txReceipt.blockNumber,
      tx.value['hex'],
      tx.data,
      txReceipt.status === 1,
      // txReceipt.logs,
    );
    return formattedTx;
  }

  async getProvider(): Promise<Provider> {
    const provider = new Provider('https://mainnet.era.zksync.io');
    return provider;
  }
}
