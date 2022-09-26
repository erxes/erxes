import { Document, Schema } from 'mongoose';
import { ORDER_ITEM_STATUSES } from './constants';
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
  bonusCount?: number;
  bonusVoucherId?: string;
  orderId?: string;
  isPackage?: boolean;
  isTake?: boolean;
  status?: string;
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
      positive: true,
      optional: true
    }),
    discountPercent: getNumberFieldDefinition({
      label: 'Discount percent',
      discount: true,
      optional: true,
      default: 0
    }),
    bonusCount: getNumberFieldDefinition({
      label: 'Bonus count',
      positive: true,
      optional: true
    }),
    bonusVoucherId: field({ type: String, label: 'Bonus Voucher' }),
    orderId: field({ type: String, label: 'Order id', index: true }),
    isPackage: field({
      type: Boolean,
      default: false,
      label: 'Is Package'
    }),
    isTake: field({
      type: Boolean,
      label: 'order eat but some take',
      default: false
    }),
    status: field({
      type: String,
      label: 'status of order item',
      enum: ORDER_ITEM_STATUSES.ALL,
      default: ORDER_ITEM_STATUSES.NEW
    })
  }),
  'erxes_orderItem'
);
