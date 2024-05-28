import { Schema, Document } from 'mongoose';
import { field } from './utils';

export interface IRCFA {
  _id?: string;
  mainType: string;
  mainTypeId: string;
  createdAt: Date;
  userId: string;
  closedAt?: Date;
  labelIds: string[];
}

export interface IRCFADocument extends IRCFA, Document {
  _id: string;
  questions?: any;
}

export const rcfaSchema = new Schema({
  _id: field({ pkey: true }),
  mainType: field({ type: String }),
  mainTypeId: field({ type: String }),
  createdAt: field({ type: Date, default: Date.now }),
  userId: field({ type: String, optional: true }),
  closedAt: field({ type: Date, optional: true }),
  labelIds: field({ type: [String], optional: true })
});
