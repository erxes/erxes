import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface ICPUserCard {
  type: 'deal' | 'task' | 'ticket' | 'purchase';
  cardId: string;
}

export interface ICPUserCardDocument extends ICPUserCard, Document {
  _id: string;
  userIds: string[];
  createdAt: Date;
}

export const cpUserCardSchema = new Schema({
  _id: field({ pkey: true }),
  type: field({ type: String }),
  cardId: field({ type: String }),
  userIds: field({ type: [String] }),
  createdAt: field({ type: Date, default: Date.now })
});
