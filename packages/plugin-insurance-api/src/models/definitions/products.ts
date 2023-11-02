import { Document, Schema } from 'mongoose';

import { field } from './utils';

export type ProductConfig = {
  companyId: string;
  specificPrice?: number;
};

export type RiskConfig = {
  riskId: string;
  coverage?: number;
  coverageLimit?: number;
};

export interface IInsuranceProduct {
  name: string;
  code: string;
  description?: string;
  price: number;
  companyProductConfigs?: ProductConfig[];
  riskConfigs?: RiskConfig[];
  categoryId: string;
}

export interface IInsuranceProductDocument extends IInsuranceProduct, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy: string;
}

export const riskSchema = new Schema(
  {
    riskId: field({ type: String, required: true }),
    coverage: field({ type: Number, min: 0, max: 100 }),
    coverageLimit: field({ type: Number, min: 0, max: 100 })
  },
  { _id: false }
);

export const productSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ required: true, type: String }),
  code: field({ required: true, unique: true, type: String }),
  description: field({ optional: true, type: String }),
  price: field({ required: true, type: Number }),
  createdAt: field({ type: Date, default: Date.now }),
  updatedAt: field({ type: Date, default: Date.now }),
  lastModifiedBy: field({ type: String, optional: true }),
  searchText: field({ type: String, optional: true }),
  companyProductConfigs: field({ type: [Schema.Types.Mixed], optional: true }),
  riskConfigs: field({ type: [riskSchema], optional: true }),
  categoryId: field({ type: String, optional: true })
});
