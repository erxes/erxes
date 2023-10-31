import { Document, Schema } from 'mongoose';

import { field } from './utils';

export type ProductConfig = {
  companyId: string;
  specificPrice?: number;
};

export interface IInsuranceProduct {
  name: string;
  code: string;
  description?: string;
  price: number;
  riskIds?: string[];

  companyProductConfigs?: ProductConfig[];
}

export interface IInsuranceProductDocument extends IInsuranceProduct, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy: string;
}

export const productSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ required: true, type: String }),
  code: field({ required: true, unique: true, type: String }),
  description: field({ optional: true, type: String }),
  price: field({ required: true, type: Number }),
  riskIds: field({ optional: true, type: [String] }),
  createdAt: field({ type: Date, default: Date.now }),
  updatedAt: field({ type: Date, default: Date.now }),
  lastModifiedBy: field({ type: String, optional: true }),
  searchText: field({ type: String, optional: true }),
  companyProductConfigs: field({ type: [Schema.Types.Mixed], optional: true })
});
