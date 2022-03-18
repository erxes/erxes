import { Document, Schema } from 'mongoose';
import { field, schemaWrapper } from './utils';

export interface IOrderItem {
  productId: string;
  quantity: number;
  price: number;
  total: number;
}

export interface IFormOrder {
  formId: string;
  integrationId: string;
  customerId: string;
  items: IOrderItem[];
  status: string;
  invoiceId: string;
}

export interface IFormOrderDocument extends IFormOrder, Document {
  _id: string;
  createdAt: Date;
}

// Mongoose schemas ===========
export const orderItemSchema = new Schema(
  {
    productId: field({
      type: String,
      label: 'Product id',
      required: true
    }),
    quantity: field({
      type: Number,
      label: 'Quantity',
      required: true,
      default: 1
    }),
    price: field({
      type: Number,
      label: 'price',
      required: true,
      default: 0
    }),
    total: field({
      type: Number,
      label: 'Total',
      optional: false
    })
  },
  { _id: false }
);

export const formOrderSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    formId: field({ type: String, required: true, label: 'Form id' }),
    integrationId: field({
      type: String,
      required: true,
      label: 'Integration id'
    }),
    customerId: field({ type: String, required: true, label: 'Customer id' }),
    items: field({ type: [orderItemSchema], label: 'Order items' }),
    createdAt: field({ type: Date, label: 'Created at' }),
    status: field({ type: String, label: 'Order status' }),
    invoiceId: field({ type: String, label: 'Invoice id' })
  })
);
