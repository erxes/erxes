import { Document, Schema } from 'mongoose';
import { field } from './utils';

export const loyaltyConfigSchema = new Schema({
  _id: field({ pkey: true }),
  code: field({ type: String, unique: true }),
  value: field({ type: Object }),
});
