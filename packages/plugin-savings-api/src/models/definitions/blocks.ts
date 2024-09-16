import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export interface IBlock {
  number?: string;
  blockType: string;
  contractId?: string;
  customerId?: string;
  companyId?: string;
  description?: string;
  payDate: Date;
  amount: number;
  didAmount: number;
  status: string;
  currency: string;
  scheduleDate: Date;
  contractReaction?: any;
}

export interface IBlockDocument extends IBlock, Document {
  _id: string;
  createdAt?: Date;
  createdBy?: string;
}

export const blockSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    contractId: field({
      type: String,
      label: 'Saving Contract Type',
      index: true
    }),
    blockType: field({
      type: String,
      label: 'Block Type',
      enum: ['scheduleTransaction', 'loanPayment'],
      // loanPayment - orj irenguut ni avah, scheduleTransaction gartsiig haaj baiga
      optional: true,
    }),
    number: field({
      type: String,
      label: 'Number',
      optional: true,
      index: true
    }),
    amount: field({
      type: Number,
      label: 'Amount',
      default: 0,
      index: true
    }),
    didAmount: field({
      type: Number,
      label: 'Amount',
      default: 0,
      index: true
    }),
    status: field({
      type: String,
      label: 'Status',
      optional: true,
      index: true
    }),
    currency: field({
      type: String,
      label: 'Currency',
      optional: true,
      index: true
    }),
    createdAt: field({
      type: Date,
      default: () => new Date(),
      label: 'Created at'
    }),
    scheduleDate: field({
      type: Date,
      default: () => new Date(),
      label: 'Created at'
    }),
    contractReaction: field({ type: Object, label: 'Contract reaction' })
  }),
  'erxes_contractSchema'
);
