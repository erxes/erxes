import { Document, Schema } from 'mongoose';
import { commonItemFieldsSchema, IItemCommonFields } from './boards';

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
  voteCount: {
    type: Number,
    default: 0,
    optional: true,
    label: 'Vote count'
  },
  votedUserIds: { type: [String], label: 'Voted users' },

  hackStages: { type: [String], optional: true, label: 'Stages' },
  reach: { type: Number, default: 0, optional: true, label: 'React' },
  impact: {
    type: Number,
    default: 0,
    optional: true,
    label: 'Impact'
  },
  confidence: {
    type: Number,
    default: 0,
    optional: true,
    label: 'Confidence'
  },
  ease: { type: Number, default: 0, optional: true, label: 'Ease' }
});
