import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface IProductsConfig {
  code: string;
  value: any;
}

export interface IProductsConfigDocument extends IProductsConfig, Document {
  _id: string;
}

// Mongoose schemas ===========

export const productsConfigSchema = new Schema({
  _id: field({ pkey: true }),
  code: field({ type: String, unique: true }),
  value: field({ type: Object })
});

// etc codes: IS_UOM, DEFAULT_UOM,
