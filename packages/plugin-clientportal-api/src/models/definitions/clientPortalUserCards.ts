import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface ICPUserCard {
  contentType: 'deal' | 'task' | 'ticket' | 'purchase';
  contentTypeId: string;
  cpUserId: string;
  status?:
    | 'participating'
    | 'invited'
    | 'left'
    | 'rejected'
    | 'won'
    | 'lost'
    | 'completed';
  paymentStatus?: 'paid' | 'unpaid';
  paymentAmount?: number;
  offeredAmount?: number;
  hasVat?: boolean;
}

export interface ICPUserCardDocument extends ICPUserCard, Document {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
}

export const cpUserCardSchema = new Schema({
  _id: field({ pkey: true }),
  contentType: field({
    type: String,
    enum: ['deal', 'task', 'ticket', 'purchase']
  }),
  contentTypeId: field({ type: String }),
  cpUserId: field({ type: String }),
  status: field({
    type: String,
    default: 'participating',
    enum: [
      'participating',
      'invited',
      'left',
      'rejected',
      'won',
      'lost',
      'completed'
    ]
  }),
  paymentStatus: field({ type: String, enum: ['paid', 'unpaid'] }),
  paymentAmount: field({ type: Number }),
  offeredAmount: field({ type: Number }),
  hasVat: field({ type: Boolean }),
  createdAt: field({ type: Date, default: Date.now }),
  modifiedAt: field({ type: Date, default: Date.now })
});
