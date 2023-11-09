import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface IBot {
  name: string;
  integrationId: string;
  pageId: string;
  status: string;
}

export interface IBotDocument extends IBot, Document {
  _id: string;
}

export const botSchema = new Schema({
  _id: field({ pkey: true }),
  name: { type: String },
  integrationId: { type: String },
  pageId: { type: String }
});
