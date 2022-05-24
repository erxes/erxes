import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './util';

export interface IPosOrderItem {
  createdAt: Date;
  productId: String;
  count: Number;
  unitPrice: Number;
  discountAmount: Number;
  discountPercent: Number;
}
export interface IPosOrderItemDocument extends IPosOrderItem, Document {
  _id: string;
}
export interface IPosOrder {
  createdAt: Date;
  status: String;
  paidDate: Date;
  number: String;
  customerId: String;
  cardAmount: Number;
  cashAmount: Number;
  mobileAmount: Number;
  totalAmount: Number;
  finalAmount: Number;
  shouldPrintEbarimt: Boolean;
  printedEbarimt: Boolean;
  billType: String;
  billId: String;
  oldBillId: String;
  type: String;
  userId: String;
  items: String;
  branchId: String;
  posToken: String;
  syncId: String;
  syncedErkhet: Boolean;
  deliveryInfo: Object;
}
export interface IPosOrderDocument extends IPosOrder, Document {
  _id: string;
}
export interface IPos {
  name: String;
  description: String;
  userId: String;
  createdAt: Date;
  productDetails: String;
  adminIds: String;
  cashierIds: String;
  isOnline: Boolean;
  branchId: String;
  allowBranchIds: String;
  beginNumber: String;
  maxSkipNumber: Number;
  waitingScreen: Object;
  kioskMachine: Object;
  kitchenScreen: Object;
  uiOptions: Object;
  token: String;
  ebarimtConfig: Object;
  erkhetConfig: Object;
  syncInfos: Object;
  catProdMappings: Object;
  initialCategoryIds: String;
  kioskExcludeProductIds: String;
  deliveryConfig: Object;
}
export interface IPosDocument extends IPos, Document {
  _id: string;
}
export interface IProductGroup {
  name: String;
  description: String;
  posId: String;
  categoryIds: String;
  excludedCategoryIds: String;
  excludedProductIds: String;
}
export interface IProductGroupDocument extends IProductGroup, Document {
  _id: string;
}

const posOrderItemSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ type: String }),
    createdAt: field({ type: Date }),
    productId: field({ type: String, label: 'Product' }),
    count: field({ type: Number }),
    unitPrice: field({ type: Number }),
    discountAmount: field({ type: Number }),
    discountPercent: field({ type: Number })
  }),
  'erxes_posOrderItem'
);

export const posOrderSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    createdAt: field({ type: Date }),
    status: field({ type: String, label: 'Status of the order' }),
    paidDate: field({ type: Date, label: 'Paid date' }),
    number: field({ type: String, label: 'Order number' }),
    customerId: field({ type: String, label: 'Customer' }),
    cardAmount: field({ type: Number }),
    cashAmount: field({ type: Number }),
    mobileAmount: field({ type: Number }),
    totalAmount: field({ type: Number }),
    finalAmount: field({ type: Number }),
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
    type: field({ type: String }),
    userId: field({ type: String, label: 'Created user id' }),

    items: field({ type: posOrderItemSchema, label: 'items' }),
    branchId: field({ type: String, label: 'Branch' }),
    posToken: field({ type: String, optional: true }),
    syncId: field({ type: String, optional: true }),

    syncedErkhet: field({ type: Boolean, default: false }),
    deliveryInfo: field({
      type: Object,
      optional: true,
      label: 'Delivery Info, address, map, etc'
    })
  }),
  'erxes_posOrders'
);

export const posSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' }),
    description: field({ type: String, label: 'Description', optional: true }),
    userId: field({ type: String, optional: true, label: 'Created by' }),
    createdAt: field({ type: Date, label: 'Created at' }),
    productDetails: field({ type: [String], label: 'Product fields' }),
    adminIds: field({ type: [String], label: 'Admin user ids' }),
    cashierIds: field({ type: [String], label: 'Cashier ids' }),
    isOnline: field({ type: Boolean, label: 'Is online pos' }),
    branchId: field({ type: String, optional: true, label: 'Branch' }),
    allowBranchIds: field({
      type: [String],
      optional: true,
      label: 'Allow branches'
    }),
    beginNumber: field({ type: String, optional: true, label: 'Begin number' }),
    maxSkipNumber: field({
      type: Number,
      optional: true,
      label: 'Skip number'
    }),
    waitingScreen: field({ type: Object, label: 'Waiting screen config' }),
    kioskMachine: field({ type: Object, label: 'Kiosk config' }),
    kitchenScreen: field({ type: Object, label: 'Kitchen screen config' }),
    uiOptions: field({ type: Object, label: 'UI Options' }),
    token: field({ type: String, label: 'Pos token' }),
    ebarimtConfig: field({ type: Object, label: 'Ebarimt Config' }),
    erkhetConfig: field({ type: Object, label: 'Erkhet Config' }),
    syncInfos: field({ type: Object, label: 'sync info' }),
    catProdMappings: field({
      type: [Object],
      label: 'Category product mappings',
      optional: true
    }),
    initialCategoryIds: field({
      type: [String],
      label: 'Pos initial categories'
    }),
    kioskExcludeProductIds: field({
      type: [String],
      label: 'Kiosk exclude products'
    }),
    deliveryConfig: field({ type: Object, label: 'Delivery Config' })
  }),
  'erxes_pos'
);

export const productGroupSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' }),
    description: field({ type: String, label: 'Description', optional: true }),
    posId: field({ type: String, label: 'Pos id' }),
    categoryIds: field({
      type: [String],
      optional: true,
      label: 'Category ids'
    }),

    excludedCategoryIds: field({
      type: [String],
      optional: true,
      label: 'Exclude Category ids'
    }),

    excludedProductIds: field({
      type: [String],
      optional: true,
      label: 'Exclude Product ids'
    })
  }),
  'erxes_productGroup'
);
