import { Document, Schema } from 'mongoose';
import { field } from './utils';
import { OWNER_TYPES } from './constants';

export interface IScoreLog {
  ownerType: string;
  ownerId: string;
  ownerIds?: string[];
  changeScore: number;
  description: string;
  createdBy?: string;
  campaignId?: string;
}

export interface IScoreLogDocument extends Document {
  _id: string;
  createdAt: Date;
}

export const scoreLogSchema = new Schema({
  _id: field({ pkey: true }),
  createdAt: field({ type: Date, label: 'Created at' }),
  createdBy: field({ type: String, label: 'Created User', optional: true }),

  ownerType: field({
    type: String,
    label: 'Owner Type',
    enum: OWNER_TYPES.ALL
  }),
  campaignId: field({ type: String, label: 'Campaign ID', optional: true }),
  ownerId: field({ type: String }),
  changeScore: field({ type: Number, label: 'Changed Score' }),
  description: field({ type: String, label: 'Description' }),
  serviceName: field({ type: String, label: 'Service name' }),
  targetId: field({ type: String, label: 'Target' }),
  action: field({ type: String, enum: ['add', 'subtract'], label: 'Action' })
});
