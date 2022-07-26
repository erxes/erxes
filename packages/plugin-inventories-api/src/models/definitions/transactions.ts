import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export interface ITransaction {
  contentType: string;
  contentId: string;
  status: string;
  date: Date;
}

export interface ITransactionDocument extends ITransaction, Document {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
  createdBy: string;
  modifiedBy: string;
}

export const transactionSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    date: field({ type: Date, label: 'Date' }),
    description: field({ type: String, label: 'description' }),
    status: field({ type: String, label: 'Status' }),
    createdAt: { type: Date, default: new Date(), label: 'Created date' },
    createdBy: { type: String, label: 'Created User' },
    modifiedAt: { type: Date, default: new Date(), label: 'Modified date' },
    modifiedBy: { type: String, label: 'Modified User' },

    contentType: field({ type: String, label: 'Content Type' }),
    contentId: field({ type: String, label: 'Content' })
  }),
  'erxes_transactions'
);

// for transactionSchema query. increases search speed, avoids in-memory sorting
transactionSchema.index({
  contentType: 1,
  contentId: 1
});
