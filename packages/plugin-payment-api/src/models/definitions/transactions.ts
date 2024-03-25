import { Document, Schema } from 'mongoose';

import { randomAlphanumeric } from '@erxes/api-utils/src/random';
import { PAYMENT_STATUS } from '../../api/constants';
import { field } from './utils';

export interface ITransaction {
  invoiceId: string;
  paymentId: string;
  paymentKind: string;
  amount: number;
  status: string;
  description?: string;
  details?: any;
  // response from selected payment method
  response: any;
}
export interface ITransactionDocument extends ITransaction, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export const transactionSchema = new Schema({
  _id: { type: String, default: () => randomAlphanumeric(32) },
  invoiceId: field({ type: String }),
  paymentId: field({ type: String }),
  paymentKind: field({ type: String }),
  amount: field({ type: Number }),
  status: field({ type: String, default: PAYMENT_STATUS.PENDING }),
  createdAt: field({ type: Date, default: new Date() }),
  updatedAt: field({ type: Date }),
  details: field({ type: Object }),
  description: field({ type: String }),
  response: field({ type: Object }),
});

transactionSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 24 * 60 * 60,
    partialFilterExpression: {
      status: PAYMENT_STATUS.PENDING,
    },
  }
);
