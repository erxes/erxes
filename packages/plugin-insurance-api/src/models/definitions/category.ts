import { Document, Schema } from 'mongoose';
import { customFieldSchema } from '@erxes/api-utils/src/types';
import { field } from './utils';

export interface IInsuranceCategory {
  name: string;
  code: string;
  description: string;
  riskIds: string[];
}

export interface IInsuranceCategoryDocument
  extends IInsuranceCategory,
    Document {
  _id: string;
  createdAt: Date;
  lastModifiedAt: Date;
  lastModifiedBy: string;
}

export const categorySchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, required: true }),
  code: field({ type: String }),
  description: field({ type: String }),
  riskIds: field({ type: [String], required: true }),
  lastModifiedBy: field({ type: String }),
  createdAt: field({ type: Date, default: Date.now }),
  lastModifiedAt: field({ type: Date, default: Date.now })
});
