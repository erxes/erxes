import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface IAccountingsConfig {
  code: string;
  value: any;
}

export interface IAccountingsConfigDocument
  extends IAccountingsConfig,
    Document {
  _id: string;
}

// Mongoose schemas ===========

export const accountingsConfigSchema = new Schema({
  _id: field({ pkey: true }),
  code: field({ type: String, unique: true }),
  value: field({ type: Object }),
});
