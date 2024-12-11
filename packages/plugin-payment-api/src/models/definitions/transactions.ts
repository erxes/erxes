import { Document, Schema } from 'mongoose';
import { nanoid } from 'nanoid';
import { PAYMENT_STATUS } from '../../api/constants';
import { field } from './utils';

export interface ITransaction {
  invoiceId: string;
  code: string;
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
  _id: { type: String, default: () => nanoid() },
  invoiceId: field({ type: String }),
  code: field({ type: String, required: false, unique: true }),
  paymentId: field({ type: String }),
  paymentKind: field({ type: String }),
  amount: field({ type: Number }),
  status: field({ type: String, default: PAYMENT_STATUS.PENDING }),
  createdAt: field({ type: Date, default: Date.now }),
  updatedAt: field({ type: Date }),
  details: field({ type: Object }),
  description: field({ type: String }),
  response: field({ type: Object }),
});


// TODO: readd after server time issue fixed
// transactionSchema.index(
//   { createdAt: 1 },
//   {
//     expireAfterSeconds: 24 * 60 * 60,
//     partialFilterExpression: {
//       status: PAYMENT_STATUS.PENDING,
//     },
//   }
// );
