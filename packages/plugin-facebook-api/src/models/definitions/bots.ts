import { Document, Schema } from 'mongoose';
import { field } from './utils';

interface IPersistentMenus {
  _id: number;
  title: string;
  type: string;
  url?: string;
}
export interface IBot {
  name: string;
  accountId: string;
  pageId: string;
  status: string;
  persistentMenus: IPersistentMenus[];
}

export interface IBotDocument extends IBot, Document {
  _id: string;
}

const persistentMenuSchema = new Schema({
  _id: { type: Number },
  title: { type: String },
  type: { type: String },
  url: { type: String, optional: true }
});

export const botSchema = new Schema({
  _id: field({ pkey: true }),
  name: { type: String },
  accountId: { type: String },
  pageId: { type: String },
  persistentMenus: { type: [persistentMenuSchema] },
  createdAt: { type: Date, default: Date.now() }
});
