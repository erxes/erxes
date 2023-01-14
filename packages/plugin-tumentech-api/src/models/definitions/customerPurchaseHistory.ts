import { Document, Schema } from 'mongoose';

import { field, schemaHooksWrapper } from './utils';

export interface IPurchaseHistory {
  cpUserId: string;
  driverId: string;
  carId: string;
  dealId: string;
  amount: number;
  phone: string;
}

export interface IPurchaseHistoryDocument extends IPurchaseHistory, Document {
  _id: string;
  createdAt: Date;
}

export const purchaseHistorySchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    cpUserId: field({ type: String, label: 'Customer Id', required: true }),
    driverId: field({ type: String, label: 'Driver Id', required: true }),
    carId: field({ type: String, label: 'Car Id', required: true }),
    amount: field({ type: Number, label: 'Amount', required: true }),
    dealId: field({ type: String, label: 'Deal Id', required: true }),
    phone: field({ type: String, label: 'Phone', required: true }),
    createdAt: field({
      type: Date,
      label: 'Created At',
      required: true,
      default: Date.now
    })
  }),
  'tumentech_purchase_history'
);

purchaseHistorySchema.index({ cpUserId: 1 });
