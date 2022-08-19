import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface ILoyaltyConfig {
  code: string;
  value: any;
}

export interface ILoyaltyConfigDocument extends ILoyaltyConfig, Document {
  _id: string;
}

export const loyaltyConfigSchema = new Schema({
  _id: field({ pkey: true }),
  code: field({ type: String, unique: true }),
  value: field({ type: Object })
});
