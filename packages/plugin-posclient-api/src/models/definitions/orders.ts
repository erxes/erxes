import { Document, Schema } from 'mongoose';
import {
  field,
  getDateFieldDefinition,
  getNumberFieldDefinition,
  schemaHooksWrapper
} from './utils';
import { IOrderItemDocument } from './orderItems';
import { ORDER_STATUSES, ORDER_TYPES } from './constants';

export interface IPaidAmount {
  _id?: string;
  type: string;
  amount: number;
  info?: any;
}

export interface IOrder {
  status?: string;
  createdAt?: Date;
  modifiedAt?: Date;
  userId?: string;
  paidDate?: Date;
  dueDate?: Date;
  number?: string;
  customerId?: string;
  customerType?: string;
  cashAmount?: number;
  mobileAmount?: number;
  paidAmounts?: IPaidAmount[];
  totalAmount: number;
  finalAmount?: number;
  shouldPrintEbarimt?: boolean;
  printedEbarimt?: boolean;
  billType?: string;
  billId?: string;
  registerNumber?: string;
  oldBillId?: string;
  type?: string;
  branchId?: string;
  departmentId?: string;
  synced?: boolean;
  origin?: string;
  posToken?: string;
  subToken?: string;
  deliveryInfo?: any;

  //posSlot
  slotCode?: string;
  taxInfo?: any;
  convertDealId?: string;
}

const commonAttributes = { positive: true, default: 0 };

export interface IOrderDocument extends Document, IOrder {
  _id: string;
  items: IOrderItemDocument[];
}

const paidAmountSchema = new Schema({
  _id: field({ pkey: true }),
  type: field({ type: String }),
  amount: getNumberFieldDefinition({
    ...commonAttributes,
    label: 'Paid amount'
  }),
  info: field({ type: Object })
});

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
      index: true
    }),
    paidDate: field({ type: Date, label: 'Paid date' }),
    dueDate: field({ type: Date, label: 'Due date' }),
    number: field({
      type: String,
      label: 'Order number',
      index: true
    }),
    customerId: field({ type: String, optional: true, label: 'Customer' }),
    customerType: field({
      type: String,
      optional: true,
      label: 'Customer type'
    }),
    cashAmount: getNumberFieldDefinition({
      ...commonAttributes,
      label: 'Cash amount'
    }),
    mobileAmount: getNumberFieldDefinition({
      ...commonAttributes,
      label: 'Mobile amount'
    }),
    paidAmounts: field({ type: [paidAmountSchema], label: 'Paid amounts' }),
    totalAmount: getNumberFieldDefinition({
      ...commonAttributes,
      label: 'Total amount before tax'
    }),
    finalAmount: getNumberFieldDefinition({
      ...commonAttributes,
      label: 'Final amount after tax'
    }),
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
      optional: true,
      label: 'Ebarimt receiver entity type'
    }),
    billId: field({ type: String, label: 'Bill id' }),
    registerNumber: field({
      type: String,
      optional: true,
      label: 'Register number of the entity'
    }),
    oldBillId: field({
      type: String,
      label: 'Previous bill id if it is changed'
    }),
    type: field({
      type: String,
      label: 'Choice to take, eat or save the order',
      enum: ORDER_TYPES.ALL,
      default: ORDER_TYPES.EAT
    }),
    branchId: field({ type: String, optional: true, label: 'Branch' }),
    departmentId: field({ type: String, optional: true, label: 'Branch' }),
    userId: field({
      type: String,
      optional: true,
      label: 'Created user id'
    }),
    synced: field({
      type: Boolean,
      default: false,
      label: 'synced on erxes'
    }),
    posToken: field({
      type: String,
      optional: true,
      label: 'posToken',
      index: true
    }),
    subToken: field({
      type: String,
      optional: true,
      label: 'If From online posToken',
      index: true
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
      label: 'Delivery Info, address, map, etc'
    }),
    origin: field({
      type: String,
      label: 'Origin of the order',
      optional: true
    }),
    slotCode: field({
      type: String,
      optional: true,
      label: 'Slot code'
    }),
    taxInfo: field({ type: Object, optional: true }),
    convertDealId: field({
      type: String,
      optional: true,
      label: 'Converted Deal'
    })
  }),
  'erxes_orders'
);

orderSchema.index({ posToken: 1, number: 1 }, { unique: true });
orderSchema.index({ posToken: 1, userId: 1, date: 1 });
