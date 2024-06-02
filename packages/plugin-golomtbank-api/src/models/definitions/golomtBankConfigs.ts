import { field } from '@erxes/api-utils/src/definitions/utils';
import { Document, Schema } from 'mongoose';

export interface IGolomtBankConfig {
  name: string;
  description: string;
  consumerKey: string;
  secretKey: string;
}

export interface IGolomtBankConfigDocument extends IGolomtBankConfig, Document {
  _id: string;
  createdAt: Date;
}

export const golomtBankConfigSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, required: true }),
  description: field({ type: String }),
  createdAt: field({ type: Date, default: Date.now }),
  consumerKey: field({ type: String, required: true }),
  secretKey: field({ type: String, required: true })
});
