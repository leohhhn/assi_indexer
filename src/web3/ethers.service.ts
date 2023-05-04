import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ethers } from 'ethers';
import { Cron } from '@nestjs/schedule';
import { TransactionService } from '../transactions/transaction.service';
import { BlockJobProducerService } from '../transactions/blockJobProducer.service';
import { BlockWithTransactions } from 'zksync-web3/build/src/types';
import { Provider } from 'zksync-web3';

@Injectable()
export class EthersService implements OnModuleInit {
  private confirmations = 15;
  private redoBlocks = 0; // when indexer is not up-to-date, reindex latest x blocks in DB just in case
  private indexing = false;

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

    let latestBlockNumberInDB = await this.transactionService.getLatestBlockInDB();
    this.logger.warn(`Latest block in DB: ${latestBlockNumberInDB}`);

    latestBlockNumberInDB = 2792544;

    const latestBlockOnChain = await provider.getBlockNumber();
    this.logger.warn(`Latest on-chain block: ${latestBlockOnChain}`);
    this.indexing = true;

    if (latestBlockOnChain - latestBlockNumberInDB > 0) {
      this.logger.warn(
        `Indexer is ${latestBlockOnChain - latestBlockNumberInDB} blocks late. Initializing catch-up...`,
      );
      this.createCatchUpJobs(latestBlockNumberInDB, latestBlockOnChain, provider); // might miss blocks between creating catchup jobs & starting cron// todo fix
    }
  }

  async getProvider(): Promise<Provider> {
    // zkSync api endpoint
    const provider = new Provider('https://mainnet.era.zksync.io');
    return provider;
  }

  @Cron('*/1 * * * * *') // every 1s
  async fetchNewBlock() {
    if (!this.indexing) return; // indexing not started yet
    try {
      const provider = await this.getProvider();
      const latestBlockNumber = await this.getLatestOnChainBlockNumber(provider);

      const latestBlock: BlockWithTransactions = await provider.getBlockWithTransactions(latestBlockNumber);

      this.logger.log('Fetching block: ', latestBlockNumber);
      this.logger.log('Block timestamp: ', new Date(latestBlock.timestamp * 1000));

      await this.blockJobProducer.addBlockJob(latestBlock);
    } catch (error) {
      this.logger.error(error);
    }
  }

  async createCatchUpJobs(latestBlockInDB: number, latestBlockOnChain: number, provider: Provider) {
    for (let i = latestBlockInDB - this.redoBlocks; i < latestBlockOnChain; i++) {}
  }

  async getETHBalance(address: string): Promise<string> {
    return ethers.utils.formatEther(await (await this.getProvider()).getBalance(address));
  }

  async getLatestOnChainBlockNumber(provider: Provider): Promise<number> {
    return (await provider.getBlockNumber()) - this.confirmations;
  }
}
