import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { zoneLocationSchema } from './zones';

const movementItemSchema = new Schema(
  {
    productId: { type: String, required: true, label: 'Product' },
    quantity: { type: Number, required: true, min: 0, label: 'Quantity' },
    epcIds: { type: [String], default: [], label: 'EPCs' },
  },
  { _id: false },
);

export const movementSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    requestKey: { type: String, required: true, unique: true, label: 'Request key' },
    type: { type: String, enum: ['BREAK_BOX'], required: true, label: 'Type' },
    number: { type: String, required: true, label: 'Number' },
    date: { type: Date, required: true, label: 'Date' },
    zoneId: { type: String, required: true, label: 'Zone' },
    source: { type: zoneLocationSchema, required: true, label: 'Source' },
    destination: { type: zoneLocationSchema, required: true, label: 'Destination' },
    items: { type: [movementItemSchema], default: [], label: 'Items' },
    userId: { type: String, label: 'User' },
    accountingStatus: {
      type: String,
      enum: ['pending', 'success', 'error'],
      default: 'pending',
      label: 'Accounting status',
    },
    accountingResponse: { type: String, label: 'Accounting response' },
    accountingTrId: { type: String, label: 'Accounting transaction' },
  },
  { timestamps: true },
);

movementSchema.index({ createdAt: -1 });
movementSchema.index({ accountingStatus: 1, createdAt: -1 });
