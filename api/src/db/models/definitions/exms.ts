import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface IExm {
  name: string;
}

export interface IExmDocument extends IExm, Document {
  _id: string;
  createdBy: string;
  createdAt: Date;
}

// Mongoose schemas =======================

export const exmSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Name' }),
  createdBy: field({ type: String, label: 'Created by' }),
  createdAt: field({ type: Date, label: 'Created at' })
});
