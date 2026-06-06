import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const lastvieweditemSchema = new Schema({
  _id: mongooseStringRandomId,
  productId: { type: String, label: 'ProductId', index: true },
  customerId: { type: String, label: 'CustomerId', index: true },
  modifiedAt: { type: Date, label: 'Date' },
});

lastvieweditemSchema.index({ customerId: 1, productId: 1 });
