import { Document } from 'mongoose';

export interface ICleaning {
  roomId: string;
  status: string;
}
export interface ICleaningHistory {
  roomId: string;
  statusPrev: string;
  status: string;
  who: string;
  date: Date;
}
export interface ICleaningDocument extends ICleaning, Document {
  _id: string;
}

export interface ICleaningHistoryDocument extends ICleaningHistory, Document {
  _id: string;
}
