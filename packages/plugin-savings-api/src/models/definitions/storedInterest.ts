import { Document, Schema } from 'mongoose';
import { schemaHooksWrapper, field } from './utils';

export interface IStoredInterest {
  description: string;
  invDate: Date;
  prevStoredDate: Date;
  amount: number;
  contractId: string;
  type: string;
}

export interface IStoredInterestDocument extends IStoredInterest, Document {
  _id: string;
  createdAt?: Date;
  createdBy?: string;
}

export const storedInterestSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    number: field({
      type: String,
      label: 'Number',
      index: true
    }),
    description: field({ type: String, optional: true, label: 'Description' }),
    type: field({ type: String, optional: true, label: 'Description' }),
    invDate: field({
      type: Date,
      default: new Date(),
      label: 'invoice date'
    }),
    prevStoredDate: field({
      type: Date,
      default: new Date(),
      label: 'Prev stored date'
    }),
    contractId: field({ type: String, min: 0, label: 'contractId' }),
    amount: field({ type: Number, min: 0, label: 'amount' }),
    periodLockId: field({ type: String, min: 0, label: 'periodLockId' }),
    createdAt: field({
      type: Date,
      default: () => new Date(),
      label: 'Created at'
    }),
    createdBy: { type: String, optional: true, label: 'created member' }
  }),
  'erxes_StoredInterestSchema'
);
