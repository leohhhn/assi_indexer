import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ethers } from 'ethers';
import { TransactionService } from './transaction.service';
import { BlockJobProducerService } from './producers/blockJobProducer.service';
import { Block, BlockWithTransactions } from 'zksync-web3/build/src/types';
import { Provider } from 'zksync-web3';

@Injectable()
export class EthersService implements OnModuleInit {
  private confirmations = 15;
  private redoBlocks = 15; // when indexer is not up-to-date, reindex latest x blocks in DB just in case
  private pollRate = 500;
  private poller;

  private readonly logger = new Logger(EthersService.name);

  constructor(
    private readonly transactionService: TransactionService,
    private readonly blockJobProducer: BlockJobProducerService,
  ) {}

  async onModuleInit() {
    await this.init();
  }

  async init() {
    this.logger.warn(`Starting indexer...`);
    const provider = await this.getProvider();

    const latestBlockNumberInDB = await this.transactionService.getLatestBlockInDB();
    this.logger.log(`Latest block in DB: ${latestBlockNumberInDB}`);

    const latestBlockOnChain = await provider.getBlockNumber();
    this.logger.warn(`Latest on-chain block: ${latestBlockOnChain}`);

    // this.poller = setInterval(() => {
    //   this.fetchNewBlock();
    // }, this.pollRate);

    // const lateBy = latestBlockOnChain - latestBlockNumberInDB;
    // if (lateBy > 0) {
    //   this.logger.warn(`Indexer is ${lateBy} blocks late. Initializing catch-up...`);
    //   this.createCatchUpJobs(latestBlockNumberInDB, latestBlockOnChain, provider); // might miss blocks between creating catchup jobs & starting cron// todo fix
    // }
  }

  async getProvider(): Promise<Provider> {
    // zkSync api endpoint
    return new Provider('https://mainnet.era.zksync.io');
  }

  async fetchNewBlock() {
    try {
      const provider = await this.getProvider();
      const latestBlockNumber = await this.getLatestOnChainBlockNumber(provider);

      const latestBlock: BlockWithTransactions = await provider.getBlockWithTransactions(latestBlockNumber);

      const latestRedundantBlock: BlockWithTransactions = await provider.getBlockWithTransactions(
        latestBlockNumber - this.redoBlocks,
      );

      this.logger.log(
        `Fetching blocks ${latestBlockNumber} & ${latestBlockNumber - this.redoBlocks}, ${new Date(
          latestBlock.timestamp * 1000,
        ).toLocaleString()}`,
      );

      await this.blockJobProducer.addBlockJob(latestBlock);
      // await this.blockJobProducer.addBlockJob(latestRedundantBlock); // do redundant block checks?
    } catch (error) {
      this.logger.error(error);
    }
  }

  async createCatchUpJobs(latestBlockInDB: number, latestBlockOnChain: number, provider: Provider) {
    for (let i = latestBlockInDB - this.redoBlocks; i < latestBlockOnChain; i++) {
      this.logger.log(`CATCHUP: fetching block ${i}`);
      const latestBlock: BlockWithTransactions = await provider.getBlockWithTransactions(i);
      await this.blockJobProducer.addBlockJob(latestBlock);
    }
  }

  async getETHBalance(address: string): Promise<string> {
    return ethers.utils.formatEther(await (await this.getProvider()).getBalance(address));
  }

  async getLatestOnChainBlockNumber(provider: Provider): Promise<number> {
    return (await provider.getBlockNumber()) - this.confirmations;
  }

  async getWholeBlock(blockNumber: string): Promise<BlockWithTransactions> {
    const provider = await this.getProvider();
    return await provider.getBlockWithTransactions(parseInt(blockNumber));
  }
}
