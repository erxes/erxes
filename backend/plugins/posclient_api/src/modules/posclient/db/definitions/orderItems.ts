import { Document, Schema } from 'mongoose';
import { ORDER_ITEM_STATUSES } from './constants';
import {
  field,
  getDateFieldDefinition,
  getNumberFieldDefinition,
  schemaHooksWrapper,
} from './utils';

export const orderItemSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    createdAt: getDateFieldDefinition('Created at'),
    productId: field({ type: String, label: 'Product' }),
    productName: field({ type: String, label: 'Product Name if subtoken' }),
    byDevice: field({ type: Object, optional: true, label: 'Device By count' }), // if qrMenu set
    count: getNumberFieldDefinition({ label: 'Count', positive: true }),
    unitPrice: getNumberFieldDefinition({
      label: 'Unit price',
      positive: true,
    }),
    discountAmount: getNumberFieldDefinition({
      label: 'Discount price amount',
      optional: true,
    }),
    discountPercent: getNumberFieldDefinition({
      label: 'Discount percent',
      discount: true,
      optional: true,
      default: 0,
    }),
    bonusCount: getNumberFieldDefinition({
      label: 'Bonus count',
      positive: true,
      optional: true,
    }),
    bonusVoucherId: field({ type: String, label: 'Bonus Voucher' }),
    orderId: field({ type: String, label: 'Order id', index: true }),
    isPackage: field({
      type: Boolean,
      default: false,
      label: 'Is Package',
    }),
    isTake: field({
      type: Boolean,
      label: 'order eat but some take',
      default: false,
    }),
    status: field({
      type: String,
      label: 'status of order item',
      enum: ORDER_ITEM_STATUSES.ALL,
      default: ORDER_ITEM_STATUSES.NEW,
    }),
    isInner: field({
      type: Boolean,
      label: 'inner or skip ebarimt',
      default: false,
    }),
    manufacturedDate: field({ type: String, label: 'manufactured' }),
    description: field({ type: String, label: 'Description' }),
    attachment: field({ type: Object, label: 'Attachment' }),
    closeDate: field({
      type: Date,
      label: 'Subscription Close Date',
      optional: true,
    }),
    couponCode: field({ type: String, label: 'Coupon code' }),
    voucherId: field({ type: String, label: 'Voucher' }),
  }),
  'erxes_orderItem',
);
