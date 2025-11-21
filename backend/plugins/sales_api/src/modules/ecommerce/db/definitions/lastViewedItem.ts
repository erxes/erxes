import { Schema } from 'mongoose';

export const lastvieweditemSchema = new Schema({
  _id: { pkey: true },
  productId: { type: String, label: 'ProductId', index: true },
  customerId: { type: String, label: 'CustomerId', index: true },
  modifiedAt: { type: Date, label: 'Date' }
});

lastvieweditemSchema.index({ customerId: 1, productId: 1 });
