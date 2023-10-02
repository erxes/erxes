import { IAttachment } from '@erxes/api-utils/src/types';
import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export interface IPosOrderItem {
  createdAt?: Date;
  productId: string;
  count: number;
  unitPrice?: number;
  discountAmount?: number;
  discountPercent?: number;
  bonusCount?: number;
  bonusVoucherId?: string;
  isPackage?: boolean;
  isTake?: boolean;
  manufacturedDate?: string;
  description?: string;
  attachment?: IAttachment;
}
export interface IPosOrderItemDocument extends IPosOrderItem, Document {
  _id: string;
}
export interface IPaidAmount {
  _id?: string;
  type: string;
  amount: number;
  info?: any;
}

export interface IMobileAmount {
  _id?: string;
  amount: number;
}

export interface IPosOrder {
  createdAt: Date;
  status: string;
  paidDate?: Date;
  dueDate?: Date;
  number: string;
  customerId?: string;
  customerType?: string;
  cashAmount?: number;
  mobileAmount?: number;
  mobileAmounts: IMobileAmount[];
  paidAmounts?: IPaidAmount[];
  totalAmount?: number;
  finalAmount?: number;
  shouldPrintEbarimt?: Boolean;
  printedEbarimt?: Boolean;
  billType?: string;
  billId?: string;
  oldBillId?: string;
  type: string;
  userId?: string;
  items?: IPosOrderItem[];
  branchId: string;
  departmentId: string;
  posToken: string;
  syncedErkhet?: Boolean;
  syncErkhetInfo?: string;
  deliveryInfo?: any;
  description?: string;
  isPre?: boolean;
  origin?: string;
  taxInfo?: any;
  convertDealId?: string;
  returnInfo?: any;
}
export interface IPosOrderDocument extends IPosOrder, Document {
  _id: string;
}

export interface IProductGroup {
  name: string;
  description: string;
  posId: string;
  categoryIds?: string[];
  excludedCategoryIds?: string[];
  excludedProductIds: string[];
}
export interface IProductGroupDocument extends IProductGroup, Document {
  _id: string;
}

export interface IPosSlot {
  _id?: string;
  posId: string;
  name: string;
  code: string;
}

export interface IPosSlotDocument extends IPosSlot, Document {
  _id: string;
}

const posOrderItemSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    createdAt: field({ type: Date, label: 'Created at' }),
    productId: field({ type: String, label: 'Product', esType: 'keyword' }),
    count: field({ type: Number, label: 'Count' }),
    unitPrice: field({ type: Number, label: 'Unit price' }),
    discountAmount: field({
      type: Number,
      label: 'Discount price amount',
      optional: true
    }),
    discountPercent: field({
      type: Number,
      label: 'Discount percent',
      optional: true
    }),
    bonusCount: field({ type: Number, label: 'Bonus count', optional: true }),
    bonusVoucherId: field({ type: String, label: 'Bonus Voucher' }),
    orderId: field({ type: String, label: 'Order id' }),
    isPackage: field({ type: Boolean, default: false, label: 'Is Package' }),
    isTake: field({
      type: Boolean,
      label: 'order eat but some take',
      default: false
    }),
    isInner: field({
      type: Boolean,
      label: 'inner or skip ebarimt',
      default: false
    }),
    manufacturedDate: field({ type: String, label: 'manufactured' }),
    description: field({ type: String, label: 'Description' }),
    attachment: field({ type: Object, label: 'Attachment' })
  }),
  'erxes_posOrderItem'
);

const paidAmountSchema = new Schema({
  _id: field({ pkey: true }),
  type: field({ type: String }),
  amount: field({ type: Number }),
  info: field({ type: Object })
});

const mobileAmountSchema = new Schema({
  _id: field({ pkey: true }),
  amount: field({ type: Number })
});

const returnInfoSchema = new Schema({
  cashAmount: field({ type: Number }),
  paidAmounts: field({ type: [paidAmountSchema] }),
  returnAt: field({ type: Date }),
  returnBy: field({ type: String }),
  description: field({ type: String })
});

export const posOrderSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    createdAt: field({ type: Date }),
    status: field({ type: String, label: 'Status of the order', index: true }),
    paidDate: field({ type: Date, label: 'Paid date' }),
    dueDate: field({ type: Date, label: 'Due date' }),
    number: field({ type: String, label: 'Order number', index: true }),
    customerId: field({ type: String, label: 'Customer' }),
    customerType: field({ type: String, label: 'Customer type' }),
    cashAmount: field({ type: Number, label: 'Cash amount' }),
    mobileAmount: field({ type: Number, label: 'Mobile amount' }),
    mobileAmounts: field({
      type: [mobileAmountSchema],
      optional: true,
      label: 'Mobile amounts'
    }),
    paidAmounts: field({ type: [paidAmountSchema], label: 'Paid amounts' }),
    totalAmount: field({ type: Number, label: 'Total amount' }),
    finalAmount: field({ type: Number, label: 'finalAmount' }),
    shouldPrintEbarimt: field({
      type: Boolean,
      label: 'Should print ebarimt for this order'
    }),
    printedEbarimt: field({
      type: Boolean,
      label: 'Printed ebarimt',
      default: false
    }),
    billType: field({
      type: String,
      label: 'Ebarimt receiver entity type'
    }),
    billId: field({ type: String, label: 'Bill id' }),
    registerNumber: field({
      type: String,
      label: 'Register number of the entity'
    }),
    oldBillId: field({
      type: String,
      label: 'Previous bill id if it is changed'
    }),
    type: field({ type: String, label: 'Order type' }),
    userId: field({ type: String, label: 'Created user' }),

    items: field({ type: [posOrderItemSchema], label: 'items' }),
    branchId: field({ type: String, label: 'Branch' }),
    departmentId: field({ type: String, label: 'Department' }),
    posToken: field({ type: String, optional: true, label: 'Token' }),

    syncedErkhet: field({ type: Boolean, default: false }),
    syncErkhetInfo: field({
      type: String,
      optional: true,
      label: 'SyncErkhetInfo'
    }),
    deliveryInfo: field({
      type: Object,
      optional: true,
      label: 'Delivery Info, address, map, etc'
    }),
    description: field({
      type: String,
      label: 'Description',
      optional: true
    }),
    isPre: field({
      type: Boolean,
      label: 'Is Pre-Order',
      optional: true
    }),
    origin: field({ type: String, optional: true, label: 'origin' }),
    taxInfo: field({ type: Object, optional: true }),
    convertDealId: field({
      type: String,
      optional: true,
      label: 'Converted Deal'
    }),
    returnInfo: field({
      type: returnInfoSchema,
      optional: true,
      label: 'Return information'
    })
  }),
  'erxes_posOrders'
);
