import { Document, Schema } from 'mongoose';

import { getDateFieldDefinition, getNumberFieldDefinition } from './utils';
import { ORDER_TYPES, ORDER_STATUSES } from './constants';
import { IOrderItemDocument } from './orderItems';
import { IOrderModel } from '../Orders';
import { field, schemaHooksWrapper } from './util';
// import { IQpayInvoiceDocument } from './qpayInvoices';

interface ICardPayment {
  _id: string;
  amount: number;
  cardInfo: any;
}

export interface IOrder {
  status?: string;
  createdAt?: Date;
  modifiedAt?: Date;
  paidDate?: Date;
  number?: string;
  customerId?: string;
  cardAmount?: number;
  cashAmount?: number;
  mobileAmount?: number;
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
  synced?: boolean;
  cardPaymentInfo?: string;
  origin?: string;

  // split payment info
  cardPayments?: ICardPayment[];
  posToken?: string;
  deliveryInfo?: any;
}

const commonAttributes = { positive: true, default: 0 };

// @ts-ignore
const cardPaymentSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    amount: getNumberFieldDefinition({
      ...commonAttributes,
      label: 'Paid amount'
    }),
    // @ts-ignore
    cardInfo: { type: Object, label: 'Card info' }
  }),
  'erxes_cardPayment'
);

export interface IOrderDocument extends Document, IOrder {
  _id: string;
  items: IOrderItemDocument[];

  userId?: string;
  // qpayInvoices?: IQpayInvoiceDocument[];
}

export const orderSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    createdAt: getDateFieldDefinition('Created at'),
    modifiedAt: getDateFieldDefinition('Modified at'),
    status: field({
      type: String,
      label: 'Status of the order',
      enum: ORDER_STATUSES.ALL,
      default: ORDER_STATUSES.NEW
    }),
    paidDate: field({ type: Date, label: 'Paid date' }),
    number: field({ type: String, label: 'Order number', unique: true }),
    customerId: field({ type: String, label: 'Customer' }),
    cardAmount: getNumberFieldDefinition({
      ...commonAttributes,
      label: 'Card amount'
    }),
    cashAmount: getNumberFieldDefinition({
      ...commonAttributes,
      label: 'Cash amount'
    }),
    mobileAmount: getNumberFieldDefinition({
      ...commonAttributes,
      label: 'Mobile amount'
    }),
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
    type: field({
      type: String,
      label: 'Choice to take, eat or save the order',
      enum: ORDER_TYPES.ALL,
      default: ORDER_TYPES.EAT
    }),
    branchId: field({ type: String, label: 'Branch' }),
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
    // rm this filed after a migration
    cardPaymentInfo: field({
      type: String,
      label: 'Bank card transaction info'
    }),
    cardPayments: field({
      type: [cardPaymentSchema],
      label: 'List of card payment info'
    }),
    posToken: field({
      type: String,
      optional: true,
      label: 'If From online posToken'
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
    })
  }),
  'erxes_orders'
);
