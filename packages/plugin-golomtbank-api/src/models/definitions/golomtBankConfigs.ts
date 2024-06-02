import { field } from '@erxes/api-utils/src/definitions/utils';
import { Document, Schema } from 'mongoose';

export interface IGolomtBankConfig {
  userName: string;
  organizationName: string;
  clientId: string;
  ivKey: string;
  sessionKey: string;
  password: string
}

export interface IGolomtBankConfigDocument extends IGolomtBankConfig, Document {
  _id: string;
  createdAt: Date;
}

export const golomtBankConfigSchema = new Schema({
  _id: field({ pkey: true }),
  userName: field({ type: String, required: true }),
  organizationName: field({ type: String }),
  ivKey: field({ type: String }),
  clientId: field({ type: String, required: true }),
  sessionKey: field({ type: String, required: true }),
  password: field({ type: String, required: true }),
  createdAt: field({ type: Date, default: Date.now }),
});
