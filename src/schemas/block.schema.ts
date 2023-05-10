import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuid } from 'uuid';

export type BlockDocument = Block & Document;

@Schema()
export class Block {
  @Prop()
  _id: string;

  @Prop({ unique: true })
  blockNumber: number;

  @Prop()
  txCount: number;

  constructor(blockNumber: number, txCount: number) {
    this._id = uuid();
    this.blockNumber = blockNumber;
    this.txCount = txCount;
  }
}

export const BlockSchema = SchemaFactory.createForClass(Block);
