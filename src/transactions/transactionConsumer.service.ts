import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('tx-format-queue')
export class TransactionConsumerService {

  @Process('tx-format-job')
  readOperationJob(job: Job) {
    console.log('PROCESSING JOB');
    console.log(job.data);
  }
}