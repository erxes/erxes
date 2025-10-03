import { Document, Schema } from 'mongoose';
import { PAYMENT_STATUS_TYPES } from '@/bms/constants';
import { getEnum } from '@/bms/utils';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export interface IOrder {
  _id: string;
  customerId: string;
  tourId: string;
  amount: number;
  status: string;
  note: string;
  branchId?: string;
  numberOfPeople: number;
  type?: string;
  additionalCustomers?: string[];
  invoices?: { amount: number; _id: string }[];
}

export interface IOrderDocument extends IOrder, Document {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
}

export const orderSchema = new Schema({
  _id: mongooseStringRandomId,
  createdAt: { type: Date, label: 'Created at' },
  modifiedAt: { type: Date, label: 'Modified at' },
  customerId: { type: String, optional: true, label: 'customerId' },
  tourId: { type: String, optional: true, label: 'tourId' },
  note: { type: String, optional: true, label: 'note' },
  amount: { type: Number, optional: true, label: 'amount' },
  status: {
    type: String,
    enum: getEnum(PAYMENT_STATUS_TYPES),
    default: '',
    optional: true,
    label: 'status',
    esType: 'keyword',
    selectOptions: PAYMENT_STATUS_TYPES,
  },
  branchId: { type: String, optional: true, label: 'branchId' },
  numberOfPeople: {
    type: Number,
    optional: true,
    label: 'numberOfPeople',
  },
  type: { type: String, optional: true, label: 'type' },
  invoices: { type: Object, optional: true, label: 'invoices' },
  additionalCustomers: {
    type: [String],
    optional: true,
    label: 'additionalCustomers',
  },
  parent: { type: String, optional: true, label: 'parent' },
  isChild: { type: Boolean, optional: true, label: 'isChild' },
});
