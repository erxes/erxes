import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface IBot {
  name: string;
  accountId: string;
  pageId: string;
  status: string;
}

export interface IBotDocument extends IBot, Document {
  _id: string;
}

export const botSchema = new Schema({
  _id: field({ pkey: true }),
  name: { type: String },
  accountId: { type: String },
  pageId: { type: String },
  createdAt: { type: Date, default: Date.now() }
});
