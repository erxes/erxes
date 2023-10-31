import { Document, Schema } from 'mongoose';

import { field } from './utils';

export interface IInsuranceItem {
  customerId?: string;
  companyId?: string;

  vendorUserId?: string;

  customFieldsData?: any;
}

const customFieldSchema = new Schema(
  {
    field: { type: String },
    value: { type: Schema.Types.Mixed },
    stringValue: { type: String, optional: true },
    numberValue: { type: Number, optional: true },
    dateValue: { type: Date, optional: true },
    locationValue: {
      type: {
        type: String,
        enum: ['Point'],
        optional: true
      },
      coordinates: {
        type: [Number],
        optional: true
      },
      required: false
    }
  },
  { _id: false }
);
customFieldSchema.index({ locationValue: '2dsphere' });

export interface IInsuranceItemDocument extends IInsuranceItem, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy: string;
}

export const insuranceItemSchema = new Schema({
  _id: field({ pkey: true }),
  customerId: field({ type: String, optional: true, sparse: true }),
  companyId: field({ type: String, optional: true, sparse: true }),
  vendorUserId: field({ type: String, optional: true, index: true }),

  customFieldsData: field({ type: [customFieldSchema], optional: true }),

  createdAt: field({ type: Date, default: Date.now }),
  updatedAt: field({ type: Date, default: Date.now }),
  lastModifiedBy: field({ type: String, optional: true })
});
