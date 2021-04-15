import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface IFlow {
  name?: string;
  description?: string;
  assignedUserId?: string;
}

export interface IFlowDocument extends IFlow, Document {
  _id: string;
  createdAt: Date;
}

// Mongoose schemas ===========

export const flowSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Name' }),
  description: field({ type: String, optional: true, label: 'Description' }),
  userId: field({ type: String, label: 'Created by' }),
  assignedUserId: field({ type: String }),
  createdAt: field({ type: Date, label: 'Created at' }),
});
