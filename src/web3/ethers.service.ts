import { ForbiddenException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { BlockFetchedEvent } from '../events/blockfetched.event';
import { TransactionService } from '../transactions/transaction.service';
import { Transaction } from '../transactions/schemas/transaction.schema';
import { TransactionProducerService } from '../transactions/transactionProducer.service';

@Injectable()
export class EthersService {
  private networkName = 'goerli';
  private apiProvider = 'alchemy';
  private confirmations = 5; // n of confirmations to wait
  private indexedBlocks: number[] = [];
  startup = 1;

  private readonly logger = new Logger(EthersService.name);
  private flag = 0;

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly transactionService: TransactionService,
    private readonly transactionProducer: TransactionProducerService
  ) {

  }

  async getProvider(): Promise<ethers.providers.Provider> {
    if (this.apiProvider === 'alchemy') {
      return new ethers.providers.AlchemyProvider(
        this.networkName,
        process.env.ALCHEMY_KEY
      );
    } else if (this.apiProvider === 'infura') {
      return new ethers.providers.InfuraProvider(
        this.networkName,
        process.env.INFURA_KEY
      );
    } else {
      // todo implement retrys
      throw new InternalServerErrorException(
        'Both Infura & Alchemy don\'t work as providers. Shutting down.'
      );
    }
  }

  async getETHBalance(address: string): Promise<string> {
    return ethers.utils.formatEther(
      await (
        await this.getProvider()
      ).getBalance(address)
    );
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async fetchNewBlock() {
    try {
      const provider = await this.getProvider();
      let latestBlockNumber = (await provider.getBlockNumber()) - this.confirmations;

      const lastBlockInDB = this.getLatestIndexedBlock();

      // if we're missing blocks
      if (this.startup === 1 && lastBlockInDB != -1 && latestBlockNumber - 1 > lastBlockInDB) {
        latestBlockNumber = lastBlockInDB;
        this.startup = 0;
      }

      if (this.indexedBlocks.includes(latestBlockNumber)) return;


      this.logger.log('Fetching block: ', latestBlockNumber);

      const latestBlock: ethers.providers.Block = await provider.getBlock(
        latestBlockNumber
      );

      this.logger.log(
        'Block timestamp: ',
        new Date(latestBlock.timestamp * 1000)
      );
      this.eventEmitter.emit(
        'block.fetched',
        new BlockFetchedEvent(latestBlock.timestamp, latestBlock.transactions)
      );
    } catch (error) {
      if (error.code === 403) {
        this.logger.warn('Alchemy API limit exceeded. Switching to Infura...');
        this.apiProvider = 'infura';
        // Handle duplicate key error
        throw new ForbiddenException(
          'Indexer exceeded the API limit of the current provider. Switching to different provider...'
        );
      } else {
        // Handle other errors
        throw error;
      }
    }
  }

  @OnEvent('block.fetched', { async: true })
  async insertTXFromBlock(blockFetched: BlockFetchedEvent) {
    try {
      const provider = await this.getProvider();

      const finalTXs: Transaction[] = [];

      // fetch TX from API
      for (const txHash of blockFetched.transactions) {
        const tx = await provider.getTransaction(txHash);
        const txReceipt = await provider.getTransactionReceipt(txHash);
        const formattedTX = this.formatTX(
          tx,
          txReceipt,
          blockFetched.timestamp
        );
        finalTXs.push(formattedTX);
      }
      if (finalTXs.length === 0) throw new Error('Block was possibly empty');

      this.logger.log('Inserting ' + finalTXs.length + ' transactions from block ' + finalTXs[0].block + ' in DB.');
      await this.transactionService.createTransactions(finalTXs);


    } catch (e) {
      this.logger.error(e);
    }
  }

  async getIndexedBlocks(): Promise<number[]> {
    return this.indexedBlocks;
  }

  formatTX(
    tx: ethers.providers.TransactionResponse,
    txReceipt: ethers.providers.TransactionReceipt,
    timestamp: number
  ): Transaction {

    const from = txReceipt.from !== null ? txReceipt.from.toLowerCase() : '0x0';
    const to = txReceipt.to !== null ? txReceipt.to.toLowerCase() : '0x0';

    const formattedTx = new Transaction(
      txReceipt.transactionHash,
      timestamp,
      from,
      to,
      txReceipt.gasUsed.toNumber(),
      txReceipt.effectiveGasPrice.toNumber(),
      tx.gasLimit.toNumber(),
      txReceipt.blockNumber,
      tx.value.toString(),
      tx.data,
      txReceipt.status === 1
    );
    return formattedTx;
  }

  getLatestIndexedBlock(): number {
    if (this.indexedBlocks.length === 0)
      return -1;
    return Math.max(...this.indexedBlocks);
  }
}
