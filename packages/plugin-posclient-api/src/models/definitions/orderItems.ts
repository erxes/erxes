import { Document, Schema } from 'mongoose';
import {
  field,
  getDateFieldDefinition,
  getNumberFieldDefinition,
  schemaHooksWrapper
} from './utils';

export interface IOrderItem {
  createdAt?: Date;
  productId: string;
  count: number;
  unitPrice?: number;
  discountAmount?: number;
  discountPercent?: number;
  orderId?: string;
  isPackage?: boolean;
  isTake?: boolean;
}

export interface IOrderItemDocument extends Document, IOrderItem {
  _id: string;
  productName?: string;
}

export const orderItemSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    createdAt: getDateFieldDefinition('Created at'),
    productId: field({ type: String, label: 'Product' }),
    count: getNumberFieldDefinition({ label: 'Count', positive: true }),
    unitPrice: getNumberFieldDefinition({
      label: 'Unit price',
      positive: true
    }),
    discountAmount: getNumberFieldDefinition({
      label: 'Discount price amount',
      discount: true
    }),
    discountPercent: getNumberFieldDefinition({
      label: 'Discount percent',
      discount: true,
      default: 0
    }),
    orderId: field({ type: String, label: 'Order id' }),
    isPackage: field({
      type: Boolean,
      default: false,
      label: 'Is Package'
    }),
    isTake: field({
      type: Boolean,
      label: 'order eat but some take',
      default: false
    })
  }),
  'erxes_orderItem'
);
