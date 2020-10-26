import { Document, Schema } from 'mongoose';
import { commonItemFieldsSchema, IItemCommonFields } from './boards';
import { field, schemaWrapper } from './utils';

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

export const growthHackSchema = schemaWrapper(
  new Schema({
    ...commonItemFieldsSchema,
    voteCount: field({ type: Number, default: 0, optional: true, label: 'Vote count' }),
    votedUserIds: field({ type: [String], label: 'Voted users' }),

    hackStages: field({ type: [String], optional: true, label: 'Stages' }),
    reach: field({ type: Number, default: 0, optional: true, label: 'React' }),
    impact: field({ type: Number, default: 0, optional: true, label: 'Impact' }),
    confidence: field({ type: Number, default: 0, optional: true, label: 'Confidence' }),
    ease: field({ type: Number, default: 0, optional: true, label: 'Ease' }),
  }),
);
