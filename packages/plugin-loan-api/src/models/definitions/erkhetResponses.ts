import { Document, Schema } from 'mongoose';
import { schemaHooksWrapper, field } from './utils';
export interface IErkhetResponse {
  createdAt: Date;
  contractId: string;
  transactionId?: string;
  isEbarimt: boolean;
  data: any;
}

export interface IErkhetResponseDocument extends IErkhetResponse, Document {
  _id: string;
}

export const erkhetResponseSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    createdAt: field({
      type: Date,
      default: new Date(),
      label: 'Created at'
    }),
    contractId: field({ type: String, label: 'Contract' }),
    transactionId: field({
      type: String,
      optional: true,
      label: 'transaction'
    }),
    isEbarimt: field({ type: String, default: false, label: 'Is Ebarimt' }),
    data: field({ type: Object, label: 'Response data' })
  }),
  'erxes_erkhetResponseSchema'
);
