import { Document, Schema } from 'mongoose';
import {
  field,
  getDateFieldDefinition,
  getNumberFieldDefinition,
  schemaHooksWrapper,
} from './utils';
import {
  BILL_TYPES,
  ORDER_STATUSES,
  ORDER_TYPES,
  ORDER_SALE_STATUS,
  SUBSCRIPTION_INFO_STATUS,
} from './constants';

const commonAttributes = { positive: true, default: 0 };

const paidAmountSchema = new Schema({
  _id: field({ pkey: true }),
  type: field({ type: String }),
  amount: getNumberFieldDefinition({
    ...commonAttributes,
    label: 'Paid amount',
  }),
  info: field({ type: Object }),
});

const mobileAmountSchema = new Schema({
  _id: field({ pkey: true }),
  amount: field({ type: Number }),
});

const returnInfoSchema = new Schema({
  cashAmount: field({ type: Number }),
  paidAmounts: field({ type: [paidAmountSchema] }),
  returnAt: field({ type: Date }),
  returnBy: field({ type: String }),
  description: field({ type: String }),
});

const subscriptionInfo = new Schema(
  {
    subscriptionId: field({
      type: String,
      label: 'Subscription Id',
      optional: true,
    }),
    status: field({
      type: String,
      label: 'Subscription Status',
      enum: SUBSCRIPTION_INFO_STATUS.ALL,
      default: SUBSCRIPTION_INFO_STATUS.ACTIVE,
    }),
    prevSubscriptionId: field({
      type: String,
      label: 'Previous Subscription for close when paid',
      optional: true,
    }),
  },
  { _id: false },
);

export const orderSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    createdAt: getDateFieldDefinition('Created at'),
    modifiedAt: getDateFieldDefinition('Modified at'),
    status: field({
      type: String,
      label: 'Status of the order',
      enum: ORDER_STATUSES.ALL,
      default: ORDER_STATUSES.NEW,
      index: true,
    }),
    saleStatus: field({
      type: String,
      label: 'Status of the sale',
      enum: ORDER_SALE_STATUS.ALL,
      default: ORDER_SALE_STATUS.CART,
      index: true,
    }),
    paidDate: field({ type: Date, label: 'Paid date' }),
    dueDate: field({ type: Date, label: 'Due date' }),
    number: field({
      type: String,
      label: 'Order number',
      index: true,
    }),
    customerId: field({ type: String, optional: true, label: 'Customer' }),
    customerType: field({
      type: String,
      optional: true,
      label: 'Customer type',
    }),
    cashAmount: getNumberFieldDefinition({
      ...commonAttributes,
      label: 'Cash amount',
    }),
    directDiscount: getNumberFieldDefinition({
      ...commonAttributes,
      label: 'Direct Discount',
    }),
    directIsAmount: field({
      type: Boolean,
      optional: true,
      label: 'Direct Discount is percent',
    }),
    mobileAmount: getNumberFieldDefinition({
      ...commonAttributes,
      label: 'Mobile amount',
    }),
    mobileAmounts: field({
      type: [mobileAmountSchema],
      optional: true,
      label: 'Mobile amounts',
    }),
    paidAmounts: field({ type: [paidAmountSchema], label: 'Paid amounts' }),
    totalAmount: getNumberFieldDefinition({
      ...commonAttributes,
      label: 'Total amount before tax',
    }),
    finalAmount: getNumberFieldDefinition({
      ...commonAttributes,
      label: 'Final amount after tax',
    }),
    shouldPrintEbarimt: field({
      type: Boolean,
      label: 'Should print ebarimt for this order',
    }),
    printedEbarimt: field({
      type: Boolean,
      label: 'Printed ebarimt',
      default: false,
    }),
    billType: field({
      type: String,
      optional: true,
      enum: BILL_TYPES.ALL,
      label: 'Ebarimt receiver entity type',
    }),
    billId: field({ type: String, label: 'Bill id' }),
    registerNumber: field({
      type: String,
      optional: true,
      label: 'Register number of the entity',
    }),
    oldBillId: field({
      type: String,
      label: 'Previous bill id if it is changed',
    }),
    type: field({
      type: String,
      label: 'Choice to take, eat or save the order',
      enum: ORDER_TYPES.ALL,
      default: ORDER_TYPES.EAT,
    }),
    branchId: field({ type: String, optional: true, label: 'Branch' }),
    departmentId: field({ type: String, optional: true, label: 'Branch' }),
    subBranchId: field({ type: String, optional: true, label: 'Sub Branch' }),
    userId: field({
      type: String,
      optional: true,
      label: 'Created user id',
    }),
    synced: field({
      type: Boolean,
      default: false,
      label: 'synced on erxes',
    }),
    posToken: field({
      type: String,
      optional: true,
      label: 'posToken',
      index: true,
    }),
    subToken: field({
      type: String,
      optional: true,
      label: 'If From online posToken',
      index: true,
    }),
    // {
    //   description: '',
    //   mapValue: {
    //     "locationValue": {
    //       "type": "Point",
    //       "coordinates": [
    //         106.936283111572,
    //         47.920138551642
    //       ]
    //     },
    //     "field": "dznoBhE3XCkCaHuBX",
    //     "value": {
    //       "lat": 47.920138551642,
    //       "lng": 106.936283111572
    //     },
    //     "stringValue": "106.93628311157227,47.920138551642026"
    //   }
    // }
    deliveryInfo: field({
      type: Object,
      optional: true,
      label: 'Delivery Info, address, map, etc',
    }),
    description: field({
      type: String,
      label: 'Description',
      optional: true,
    }),
    isPre: field({
      type: Boolean,
      label: 'Is Pre-Order',
      optional: true,
    }),
    origin: field({
      type: String,
      label: 'Origin of the order',
      optional: true,
    }),
    slotCode: field({
      type: String,
      optional: true,
      label: 'Slot code',
    }),
    taxInfo: field({ type: Object, optional: true }),
    convertDealId: field({
      type: String,
      optional: true,
      label: 'Converted Deal',
    }),
    returnInfo: field({
      type: returnInfoSchema,
      optional: true,
      label: 'Return information',
    }),
    subscriptionInfo: field({
      type: subscriptionInfo,
      optional: true,
      label: 'Subscription Info',
    }),
    closeDate: field({ type: Date, optional: true, label: 'Close Date' }),
    extraInfo: field({
      type: Schema.Types.Mixed,
      optional: true,
      label: 'Extra Info',
    }),
  }),
  'erxes_orders',
);

orderSchema.index({ posToken: 1, number: 1 }, { unique: true });
orderSchema.index({ posToken: 1, userId: 1, date: 1 });
