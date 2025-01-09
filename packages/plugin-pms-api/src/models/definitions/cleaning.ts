import { Document, Schema } from 'mongoose';
import { field } from './utils';

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

// Mongoose schemas ===========

export const cleaningSchema = new Schema({
  _id: field({ pkey: true }),
  roomId: field({ type: String, label: 'room id' }),
  status: field({ type: String, label: 'status' }),
});

export const cleaningHistorySchema = new Schema({
  _id: field({ pkey: true }),
  roomId: field({ type: String, label: 'room id' }),
  statusPrev: field({ type: String, label: 'status previous' }),
  status: field({ type: String, label: 'status' }),
  date: field({ type: Date, label: 'date' }),
  who: field({ type: String, label: 'status' }),
});
