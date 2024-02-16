import { Document, Schema } from 'mongoose';
import { field } from './utils';

interface IPersistentMenus {
  _id: number;
  text: string;
  type: string;
  link?: string;
}
export interface IBot {
  name: string;
  accountId: string;
  uid: string;
  pageId: string;
  token: string;
  status: string;
  persistentMenus: IPersistentMenus[];
}

export interface IBotDocument extends IBot, Document {
  _id: string;
}

const persistentMenuSchema = new Schema({
  _id: { type: Number },
  text: { type: String },
  type: { type: String },
  link: { type: String, optional: true },
});

export const botSchema = new Schema({
  _id: field({ pkey: true }),
  name: { type: String },
  accountId: { type: String },
  uid: { type: String },
  pageId: { type: String },
  token: { type: String },
  persistentMenus: { type: [persistentMenuSchema] },
  createdAt: { type: Date, default: Date.now() },
});
