import { field, schemaHooksWrapper } from './utils';
import { Document, Schema } from 'mongoose';

export interface IPeriodLock {
  createdBy: string;
  createdAt: Date;
  date: Date;
  excludeContracts: string[];
}

export interface IPeriodLockDocument extends IPeriodLock, Document {
  _id: string;
}

export const periodLockSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    createdBy: field({ type: String, label: 'Created By' }),
    createdAt: field({
      type: Date,
      default: () => new Date(),
      label: 'Created at'
    }),
    date: field({ type: Date, label: 'Lock Date' }),
    excludeContracts: field({
      type: [String],
      label: 'Exclude contracts from Lock'
    })
  }),
  'erxes_periodLockSchema'
);
