import { Document, Schema } from 'mongoose';
import { commonItemFieldsSchema, IItemCommonFields } from './boards';
import { field } from './utils';

export interface IGrowthHack extends IItemCommonFields {
  voteCount?: number;
  votedUserIds?: string[];

  hackStages?: string;
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

  voteCount: field({ type: Number, default: 0, optional: true }),
  votedUserIds: field({ type: [String], optional: true }),

  hackStages: field({ type: [String], optional: true }),
  reach: field({ type: Number, default: 0, optional: true }),
  impact: field({ type: Number, default: 0, optional: true }),
  confidence: field({ type: Number, default: 0, optional: true }),
  ease: field({ type: Number, default: 0, optional: true }),
});
