import { Document, Schema, Model } from 'mongoose';

import { CURRENCIES, PAYMENT_STATUS } from '../../api/constants';
import { field } from './utils';



export interface IInvoice {
  invoiceNumber: string;
  amount: number;
  currency: string;
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
  callback?: string;
  data?: any;
}
export interface IInvoiceDocument extends IInvoice, Document {
  _id: string;
}

export const invoiceSchema = new Schema({
  _id: field({ pkey: true }),
  invoiceNumber: field({ type: String }),
  amount: field({ type: Number }),
  currency: field({ type: String, enum: CURRENCIES, default: 'MNT' }),
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
  createdAt: field({ type: Date, default: Date.now }),
  resolvedAt: field({ type: Date }),
  data: field({ type: Schema.Types.Mixed }),
  apiResponse: field({ type: Schema.Types.Mixed }),
  callback: field({ type: String }),
});

invoiceSchema.index({ invoiceNumber: 1 });

invoiceSchema.pre<IInvoiceDocument>('save', async function (next) {
  try {
    if (!this.invoiceNumber) {
      const currentDate = new Date();
      const year = currentDate.getFullYear().toString().slice(-2);
      const month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
      const day = ('0' + currentDate.getDate()).slice(-2);
      const currentDateString = `${year}${month}${day}`;

      const lastInvoice = await (
        this.constructor as Model<IInvoiceDocument>
      ).findOne({}, {}, { sort: { createdAt: -1 } });

      if (!lastInvoice || !lastInvoice.invoiceNumber) {
        this.invoiceNumber = `INV-${currentDateString}-0001`;
      } else {
        const lastInvoiceDate = lastInvoice.invoiceNumber.split('-')[1];
        const lastValue = Number(lastInvoice.invoiceNumber.split('-').pop() || '0000');

        if (lastInvoiceDate === currentDateString) {
          const newIncrementalValue = lastValue + 1;
          const formattedIncrementalValue = ('0000' + newIncrementalValue).slice(-4);
          this.invoiceNumber = `INV-${currentDateString}-${formattedIncrementalValue}`;
        } else {
          this.invoiceNumber = `INV-${currentDateString}-0001`;
        }
      }
    }
    next();
  } catch (e) {
    next(e);
  }
});

