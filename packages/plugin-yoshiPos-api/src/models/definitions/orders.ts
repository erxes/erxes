import { Document, Schema } from 'mongoose';

import {
  field,
  getDateFieldDefinition,
  getNumberFieldDefinition
} from './utils';
import { ORDER_TYPES, ORDER_STATUSES } from './constants';
import { IOrderItemDocument } from './orderItems';
import { ICustomerDocument } from './customers';
import { IOrderModel } from '../Orders';
import { IQpayInvoiceDocument } from './qpayInvoices';

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
  totalAmount?: number;
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
const cardPaymentSchema = new Schema({
  _id: field({ pkey: true }),
  amount: getNumberFieldDefinition({
    ...commonAttributes,
    label: 'Paid amount'
  }),
  // @ts-ignore
  cardInfo: { type: Object, label: 'Card info' }
});

export interface IOrderDocument extends Document, IOrder {
  _id: string;
  items: IOrderItemDocument[];
  customer?: ICustomerDocument;
  userId?: string;
  qpayInvoices?: IQpayInvoiceDocument[];
}

export const orderSchema = new Schema<IOrderDocument, IOrderModel>({
  _id: field({ pkey: true }),
  createdAt: getDateFieldDefinition('Created at'),
  modifiedAt: getDateFieldDefinition('Modified at'),
  status: {
    type: String,
    label: 'Status of the order',
    enum: ORDER_STATUSES.ALL,
    default: ORDER_STATUSES.NEW
  },
  paidDate: { type: Date, label: 'Paid date' },
  number: { type: String, label: 'Order number', unique: true },
  customerId: { type: String, label: 'Customer' },
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
  shouldPrintEbarimt: {
    type: Boolean,
    label: 'Should print ebarimt for this order'
  },
  printedEbarimt: { type: Boolean, label: 'Printed ebarimt', default: false },
  billType: { type: String, label: 'Ebarimt receiver entity type' },
  billId: { type: String, label: 'Bill id' },
  registerNumber: { type: String, label: 'Register number of the entity' },
  oldBillId: { type: String, label: 'Previous bill id if it is changed' },
  type: {
    type: String,
    label: 'Choice to take, eat or save the order',
    enum: ORDER_TYPES.ALL,
    default: ORDER_TYPES.EAT
  },
  branchId: { type: String, label: 'Branch' },
  userId: { type: String, optional: true, label: 'Created user id' },
  synced: { type: Boolean, default: false, label: 'synced on erxes' },
  // rm this filed after a migration
  cardPaymentInfo: { type: String, label: 'Bank card transaction info' },
  cardPayments: {
    type: [cardPaymentSchema],
    label: 'List of card payment info'
  },
  posToken: { type: String, optional: true, label: 'If From online posToken' },
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
  deliveryInfo: {
    type: Object,
    optional: true,
    label: 'Delivery Info, address, map, etc'
  },
  origin: { type: String, label: 'Origin of the order', optional: true }
});
