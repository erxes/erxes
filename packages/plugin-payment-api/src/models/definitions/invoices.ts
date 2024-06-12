import { Document, Schema, Model } from 'mongoose';

import { PAYMENT_STATUS } from '../../api/constants';
import { field } from './utils';

export interface IInvoice {
  invoiceNumber: string;
  amount: number;
  phone: string;
  email: string;
  description?: string;
  status: string;
  customerType: string;
  customerId: string;
  contentType: string;
  contentTypeId: string;
  createdAt: Date;
  resolvedAt?: Date;
  redirectUri?: string;
  paymentIds: string[];

  data?: any;
}
export interface IInvoiceDocument extends IInvoice, Document {
  _id: string;
}

export const invoiceSchema = new Schema({
  _id: field({ pkey: true }),
  invoiceNumber: field({ type: String }),
  amount: field({ type: Number }),
  phone: field({ type: String }),
  email: field({ type: String }),
  paymentIds: field({ type: [String] }),
  redirectUri: field({ type: String }),

  description: field({ type: String }),
  status: field({ type: String, default: PAYMENT_STATUS.PENDING }),
  customerType: field({ type: String }),
  customerId: field({ type: String }),
  contentType: field({ type: String }),
  contentTypeId: field({ type: String }),
  createdAt: field({ type: Date, default: new Date() }),
  resolvedAt: field({ type: Date }),
  data: field({ type: Schema.Types.Mixed }),
  apiResponse: field({ type: Schema.Types.Mixed }),
});

invoiceSchema.index({ invoiceNumber: 1 });

invoiceSchema.pre<IInvoiceDocument>('save', async function (next) {
  try {
    if (!this.invoiceNumber) {
      const lastInvoice = await (
        this.constructor as Model<IInvoiceDocument>
      ).findOne({}, {}, { sort: { createdAt: -1 } });

      if (!lastInvoice) {
        const currentDate = new Date();
        const year = currentDate.getFullYear().toString().slice(-2);
        const month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
        const day = ('0' + currentDate.getDate()).slice(-2);
        this.invoiceNumber = `INV-${year}${month}${day}-0001`;
        return;
      }

      const lastValue = Number(
        lastInvoice.invoiceNumber.split('-').pop() || '0000'
      );

      const currentDate = new Date();
      const year = currentDate.getFullYear().toString().slice(-2);
      const month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
      const day = ('0' + currentDate.getDate()).slice(-2);
      const newIncrementalValue = lastValue + 1;
      const formattedIncrementalValue = ('0000' + newIncrementalValue).slice(
        -4
      );
      this.invoiceNumber = `INV-${year}${month}${day}-${formattedIncrementalValue}`;

      next();
    }
  } catch (e) {
    next(e);
  }
});
