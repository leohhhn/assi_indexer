import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class ConsistencyService {
  constructor(@InjectQueue('missing_blocks') private queue: Queue) {}
  async processDBFetch() {}

  // todo think about the analytics part,
  // how to get every data piece and how to store it in the db for easier access
}
