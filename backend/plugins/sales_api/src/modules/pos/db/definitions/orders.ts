import { mongoStringRequired, schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import { SUBSCRIPTION_INFO_STATUS } from './constants';


const posOrderItemSchema = schemaWrapper(
  new Schema({
    _id: mongoStringRequired,
    createdAt: { type: Date, label: 'Created at' },
    productId: { type: String, label: 'Product', esType: 'keyword' },
    count: { type: Number, label: 'Count' },
    unitPrice: { type: Number, label: 'Unit price' },
    discountAmount: {
      type: Number,
      label: 'Discount price amount',
      optional: true
    },
    discountPercent: {
      type: Number,
      label: 'Discount percent',
      optional: true
    },
    bonusCount: { type: Number, label: 'Bonus count', optional: true },
    bonusVoucherId: { type: String, label: 'Bonus Voucher' },
    orderId: { type: String, label: 'Order id' },
    isPackage: { type: Boolean, default: false, label: 'Is Package' },
    isTake: {
      type: Boolean,
      label: 'order eat but some take',
      default: false
    },
    isInner: {
      type: Boolean,
      label: 'inner or skip ebarimt',
      default: false
    },
    manufacturedDate: { type: String, label: 'manufactured' },
    description: { type: String, label: 'Description' },
    attachment: { type: Object, label: 'Attachment' },
    closeDate: {
      type: Date,
      label: 'Subscription Close Date',
      optional: true
    },
  })
);

const paidAmountSchema = new Schema({
  _id: mongoStringRequired,
  type: { type: String },
  amount: { type: Number },
  info: { type: Object },
});

const mobileAmountSchema = new Schema({
  _id: mongoStringRequired,
  amount: { type: Number },
});

const returnInfoSchema = new Schema({
  cashAmount: { type: Number },
  paidAmounts: { type: [paidAmountSchema] },
  returnAt: { type: Date },
  returnBy: { type: String },
  description: { type: String },
});

const subscriptionInfo = new Schema(
  {
    subscriptionId: {
      type: String,
      label: 'Subscription Id',
      optional: true
    },
    status: {
      type: String,
      label: 'Subscription Status',
      enum: SUBSCRIPTION_INFO_STATUS.ALL,
      default: SUBSCRIPTION_INFO_STATUS.ACTIVE
    },
  },
  {
    _id: false
  }
);

export const posOrderSchema = schemaWrapper(
  new Schema({
    _id: mongoStringRequired,
    createdAt: { type: Date },
    status: { type: String, label: 'Status of the order', index: true },
    paidDate: { type: Date, label: 'Paid date', index: true },
    dueDate: { type: Date, label: 'Due date' },
    number: { type: String, label: 'Order number', index: true },
    customerId: { type: String, label: 'Customer' },
    customerType: { type: String, label: 'Customer type' },
    cashAmount: { type: Number, label: 'Cash amount' },
    mobileAmount: { type: Number, label: 'Mobile amount' },
    mobileAmounts: {
      type: [mobileAmountSchema],
      optional: true,
      label: 'Mobile amounts'
    },
    paidAmounts: { type: [paidAmountSchema], label: 'Paid amounts' },
    totalAmount: { type: Number, label: 'Total amount' },
    finalAmount: { type: Number, label: 'finalAmount' },
    shouldPrintEbarimt: {
      type: Boolean,
      label: 'Should print ebarimt for this order'
    },
    printedEbarimt: {
      type: Boolean,
      label: 'Printed ebarimt',
      default: false
    },
    billType: {
      type: String,
      label: 'Ebarimt receiver entity type'
    },
    billId: { type: String, label: 'Bill id' },
    registerNumber: {
      type: String,
      label: 'Register number of the entity'
    },
    oldBillId: {
      type: String,
      label: 'Previous bill id if it is changed'
    },
    type: { type: String, label: 'Order type' },
    userId: { type: String, label: 'Created user' },

    items: { type: [posOrderItemSchema], label: 'items' },
    branchId: { type: String, label: 'Branch' },
    departmentId: { type: String, label: 'Department' },
    subBranchId: { type: String, label: 'Sub Branch' },
    posToken: { type: String, optional: true, label: 'Token' },

    syncedErkhet: { type: Boolean, default: false },
    syncErkhetInfo: {
      type: String,
      optional: true,
      label: 'SyncErkhetInfo'
    },
    deliveryInfo: {
      type: Object,
      optional: true,
      label: 'Delivery Info, address, map, etc'
    },
    description: {
      type: String,
      label: 'Description',
      optional: true
    },
    isPre: {
      type: Boolean,
      label: 'Is Pre-Order',
      optional: true
    },
    origin: { type: String, optional: true, label: 'origin' },
    taxInfo: { type: Object, optional: true },
    convertDealId: {
      type: String,
      optional: true,
      label: 'Converted Deal'
    },
    returnInfo: {
      type: returnInfoSchema,
      optional: true,
      label: 'Return information'
    },
    subscriptionInfo: {
      type: subscriptionInfo,
      optional: true,
      label: 'Subscription Info'
    },
    closeDate: { type: Date, optional: true, label: 'Close Date' },
    extraInfo: {
      type: Schema.Types.Mixed,
      optional: true,
      label: 'Extra Info'
    },
  })
);
