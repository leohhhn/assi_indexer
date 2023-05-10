import { CronExpression } from '@nestjs/schedule';

export interface Config {
  apiProvider: string;
  confirmations: number;
  fetchInterval: CronExpression;
}
