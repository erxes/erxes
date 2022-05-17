import { field, schemaHooksWrapper } from './utils';
import { Document, Schema } from 'mongoose';

export interface IAdjustment {
  createdBy: string;
  createdAt: Date;
  date: Date;
}

export interface IAdjustmentDocument extends IAdjustment, Document {
  _id: string;
}

export const adjustmentSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    createdBy: field({ type: String, label: 'Created By' }),
    createdAt: field({
      type: Date,
      default: new Date(),
      label: 'Created at'
    }),

    date: field({ type: Date, label: 'Adustment Date' })
  }),
  'erxes_adjustmentSchema'
);
