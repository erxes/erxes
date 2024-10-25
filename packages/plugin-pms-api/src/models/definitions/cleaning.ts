import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface ICleaning {
  roomId: string;
  status: string;
  date: Date;
}

export interface ICleaningDocument extends ICleaning, Document {
  _id: string;
}

// Mongoose schemas ===========

export const cleaningSchema = new Schema({
  _id: field({ pkey: true }),
  roomId: field({ type: String, label: 'room id' }),
  status: field({ type: String, label: 'status' }),
  date: field({ type: Date, label: 'date' }),
});
