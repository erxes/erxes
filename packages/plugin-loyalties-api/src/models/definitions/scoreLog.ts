import { Document, Schema } from 'mongoose';
import { field } from './utils';
import { OWNER_TYPES } from './constants';

export interface IScoreLog {
  ownerType: string;
  ownerId: string;
  changeScore: number;
  description: string;
  createdBy?: string;
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
  ownerId: field({ type: String }),
  changeScore: field({ type: Number, label: 'Changed Score' }),
  description: field({ type: String, label: 'Description' })
});
