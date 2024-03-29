import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TransactionDocument = Transaction & Document;

@Schema()
export class Transaction {
  @Prop()
  txID: string;
  @Prop({ unique: true })
  txHash: string;
  @Prop()
  timestamp: number;
  @Prop()
  from: string;
  @Prop()
  to: string;
  @Prop()
  gas: number;
  @Prop()
  gasPrice: number;
  @Prop()
  gasLimit: number;

  @Prop()
  block: number;
  @Prop()
  value: string;
  @Prop()
  data: string;
  @Prop()
  status: boolean;

  constructor(
    txHash: string,
    timestamp: number,
    from: string,
    to: string,
    gas: number,
    gasPrice: number,
    gasLimit: number,
    block: number,
    value: string,
    data: string,
    status: boolean
  ) {
    this.txHash = txHash;
    this.timestamp = timestamp;
    this.from = from;
    this.to = to;
    this.gas = gas;
    this.gasPrice = gasPrice;
    this.gasLimit = gasLimit;
    this.block = block;
    this.value = value;
    this.data = data;
    this.status = status;
  }
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
