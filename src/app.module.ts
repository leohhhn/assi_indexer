import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionModule } from './transactions/transaction.module';
import mongoose, { Connection } from 'mongoose';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';

// todos
// fetch last block from db first
// on same tx update instead of error

@Module({
  imports: [
    TransactionModule,
    MongooseModule.forRoot('mongodb://localhost/indexer'),
    ConfigModule.forRoot(),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: async (): Promise<Connection> => {
        const connection = mongoose.createConnection('mongodb://localhost/indexer');

        await connection.dropDatabase();
        return connection;
      },
    },
  ],
})
export class AppModule {}
