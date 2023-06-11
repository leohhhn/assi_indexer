import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ethers } from 'ethers';
import { TransactionService } from './transaction.service';
import { BlockJobProducerService } from './producers/blockJobProducer.service';
import { BlockWithTransactions } from 'zksync-web3/build/src/types';
import { Provider } from 'zksync-web3';
import { confirmations, doRedundantBlocks, redundantBlocks } from 'src/config';
import { BlockService } from './block.service';
import { Block } from 'src/schemas/block.schema';
import { getProvider, getWSProvider } from 'src/helpers/helpers';

@Injectable()
export class EthersService implements OnModuleInit {
  private readonly logger = new Logger(EthersService.name);

  constructor(
    private readonly transactionService: TransactionService,
    private readonly blockJobProducer: BlockJobProducerService,
    private readonly blockService: BlockService,
  ) {}

  async onModuleInit() {
    await this.init();
  }

  async init() {
    this.logger.warn(`Starting indexer...`);
    const provider = await getProvider();

    const latestBlockNumberInDB = await this.transactionService.getLatestBlockInDB();
    this.logger.log(`Latest block in DB: ${latestBlockNumberInDB}`);

    const latestBlockOnChain = await provider.getBlockNumber();
    this.logger.warn(`Latest on-chain block: ${latestBlockOnChain}`);

    const wsProvider = await getWSProvider();

    wsProvider.on('block', block => {
      this.fetchNewBlock(block);
    });

    // const lateBy = latestBlockOnChain - latestBlockNumberInDB;
    // if (lateBy > 0) {
    //   this.logger.warn(`Indexer is ${lateBy} blocks late. Initializing catch-up...`);
    //   this.createCatchUpJobs(latestBlockNumberInDB, latestBlockOnChain, provider); // might miss blocks between creating catchup jobs & starting cron// todo fix
    // }
  }

  async fetchNewBlock(blockNumber: number) {
    try {
      const provider = await getProvider();

      const latestConfirmedBlockNumber = blockNumber - confirmations;
      const latestBlock: BlockWithTransactions = await provider.getBlockWithTransactions(
        latestConfirmedBlockNumber,
      );

      this.logger.log(
        `Fetching blocks ${latestConfirmedBlockNumber} ${new Date(latestBlock.timestamp * 1000).toLocaleString()}`,
      );

      await this.blockJobProducer.addBlockJob(latestBlock);
      await this.blockService.createBlock(new Block(latestConfirmedBlockNumber, latestBlock.transactions.length));

      // redundant block checks
      if (doRedundantBlocks) {
        const latestRedundantBlock: BlockWithTransactions = await provider.getBlockWithTransactions(
          latestConfirmedBlockNumber - redundantBlocks,
        );
        await this.blockJobProducer.addBlockJob(latestRedundantBlock);
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  async createCatchUpJobs(latestBlockInDB: number, latestBlockOnChain: number, provider: Provider) {
    for (let i = latestBlockInDB - redundantBlocks; i < latestBlockOnChain; i++) {
      // todo check why latestBlockInDB - redundantBlocks
      this.logger.log(`CATCHUP: fetching block ${i}`);
      const latestBlock: BlockWithTransactions = await provider.getBlockWithTransactions(i);
      await this.blockJobProducer.addBlockJob(latestBlock);
    }
  }

  async getETHBalance(address: string): Promise<string> {
    return ethers.utils.formatEther(await (await getProvider()).getBalance(address));
  }

  async getLatestOnChainBlockNumber(provider: Provider): Promise<number> {
    return (await provider.getBlockNumber()) - confirmations;
  }

  async getWholeBlock(blockNumber: string): Promise<BlockWithTransactions> {
    const provider = await getProvider();
    return await provider.getBlockWithTransactions(parseInt(blockNumber));
  }
}
