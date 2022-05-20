import { Document, Schema } from 'mongoose';
import {
  field,
  getDateFieldDefinition,
  getNumberFieldDefinition
} from './utils';
import { IOrderItemModel } from '../OrderItems';

export interface IOrderItem {
  createdAt?: Date;
  productId?: string;
  count?: number;
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

export const orderItemSchema = new Schema<IOrderItemDocument, IOrderItemModel>({
  _id: field({ pkey: true }),
  createdAt: getDateFieldDefinition('Created at'),
  productId: { type: String, label: 'Product' },
  count: getNumberFieldDefinition({ label: 'Count', positive: true }),
  unitPrice: getNumberFieldDefinition({ label: 'Unit price', positive: true }),
  discountAmount: getNumberFieldDefinition({
    label: 'Discount price amount',
    discount: true
  }),
  discountPercent: getNumberFieldDefinition({
    label: 'Discount percent',
    discount: true,
    default: 0
  }),
  orderId: { type: String, label: 'Order id' },
  isPackage: { type: Boolean, default: false, label: 'Is Package' },
  isTake: { type: Boolean, label: 'order eat but some take', default: false }
});
