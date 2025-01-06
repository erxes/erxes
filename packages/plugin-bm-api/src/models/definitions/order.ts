import { ICustomField } from '@erxes/api-utils/src/definitions/common';
import { Schema, Document } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export interface IOrder {
  _id: string;
  customerId: string;
  tourId: string;
  amount: string;
  status: string;
  note: string;
  branchId?: string;
}

export interface IOrderDocument extends IOrder, Document {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
}

const STATUS_TYPES = [
  { label: 'paid', value: 'paid' },
  { label: 'notPaid', value: 'notPaid' },
];

const getEnum = (): string[] => {
  return STATUS_TYPES.map(option => option.value);
};

export const orderSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    createdAt: field({ type: Date, label: 'Created at' }),
    modifiedAt: field({ type: Date, label: 'Modified at' }),
    customerId: field({ type: String, optional: true, label: 'customerId' }),
    tourId: field({ type: String, optional: true, label: 'tourId' }),
    note: field({ type: String, optional: true, label: 'note' }),
    amount: field({ type: Number, optional: true, label: 'amount' }),
    status: field({
      type: String,
      enum: getEnum(),
      default: '',
      optional: true,
      label: 'status',
      esType: 'keyword',
      selectOptions: STATUS_TYPES,
    }),
    branchId: field({ type: String, optional: true, label: 'branchId' }),
  }),
  'erxes_bm_orders',
);
