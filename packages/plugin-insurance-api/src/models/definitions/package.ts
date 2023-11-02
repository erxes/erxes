import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface IInsurancePackage {
  name: string;
  productIds: string[];
}

export interface IInsurancePackageDocument extends IInsurancePackage, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy: string;
}

export const packageSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, required: true }),
  productIds: field({ type: [String], required: true }),
  lastModifiedBy: field({ type: String }),
  createdAt: field({ type: Date, default: Date.now }),
  updatedAt: field({ type: Date, default: Date.now })
});
