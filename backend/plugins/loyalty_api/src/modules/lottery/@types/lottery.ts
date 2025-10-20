import { Document } from 'mongoose';

export interface ILottery {
  name?: string;
}

export interface ILotteryDocument extends ILottery, Document {
  createdAt: Date;
  updatedAt: Date;
}
