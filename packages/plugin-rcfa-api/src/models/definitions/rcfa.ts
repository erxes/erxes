import { Schema, Document } from 'mongoose';
import { field } from './utils';

export interface IRCFA {
  _id?: string;
  mainType: string;
  mainTypeId: string;
  relType: string;
  relTypeId?: string;
  status: string;
  createdAt: Date;
  userId: string;
  closedAt?: Date;
}

export interface IRCFADocument extends IRCFA, Document {
  _id: string;
  questions?: any;
}

export const rcfaSchema = new Schema({
  _id: field({ pkey: true }),
  mainType: field({ type: String }),
  mainTypeId: field({ type: String }),
  relType: field({ type: String, optional: true }),
  relTypeId: field({ type: String, optional: true }),
  status: field({
    type: String,
    enum: ['inProgress', 'resolved'],
    default: 'inProgress'
  }),
  createdAt: field({ type: Date, default: Date.now }),
  userId: field({ type: String, optional: true }),
  closedAt: field({ type: Date, optional: true })
});
