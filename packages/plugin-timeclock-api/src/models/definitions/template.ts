import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface ITimeClock {
  userId?: string;
  shiftStart?: Date;
  shiftEnd?: Date;
}

export interface ITimeClockDocument extends ITimeClock, Document {
  _id: string;
}

export const timeSchema = new Schema({
  _id: field({ pkey: true }),
  userId: field({ type: String, label: 'User' }),
  shiftStart: field({ type: Date, label: 'Shift starting time' }),
  shiftEnd: field({ type: Date, label: 'Shift ending time' })
});
