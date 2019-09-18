import { Document, Schema } from 'mongoose';
import { commonItemFieldsSchema, IItemCommonFields } from './boards';
import { field } from './utils';

export interface IGrowthHack extends IItemCommonFields {
  hackStages?: string;
  priority?: string;
  reach?: number;
  impact?: number;
  confidence?: number;
  ease?: number;
}

export interface IGrowthHackDocument extends IGrowthHack, Document {
  _id: string;
}

export const growthHackSchema = new Schema({
  ...commonItemFieldsSchema,

  hackStages: field({ type: [String], optional: true }),
  priority: field({ type: String, optional: true }),
  reach: field({ type: Number, optional: true }),
  impact: field({ type: Number, optional: true }),
  confidence: field({ type: Number, optional: true }),
  ease: field({ type: Number, optional: true }),
});
