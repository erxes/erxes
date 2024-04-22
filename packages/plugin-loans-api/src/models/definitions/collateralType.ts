import { schemaHooksWrapper, field } from './utils';
import { Schema, Document } from 'mongoose';

export interface ICollateralTypeConfig {
  minPercent: number;
  maxPercent: number;
  defaultPercent: number;
  riskClosePercent: number;
  collateralType: string;  
}

export interface ICollateralType {
  code: string;
  name: string;
  description: string;
  status: string;
  currency: string;
  config: ICollateralTypeConfig;
}

export interface ICollateralTypeDocument extends ICollateralType, Document {
  _id: string;
}

export const collateralTypeSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    code: field({ type: String, label: 'Code', unique: true }),
    name: field({ type: String, label: 'Name' }),
    description: field({ type: String, optional: true, label: 'Description' }),
    status: field({ type: String, optional: true, label: 'Status' }),
    currency: field({ type: String, optional: true, label: 'Currency' }),
    config: field({ type: Object })
  }),
  'erxes_collateralTypeSchema'
);
