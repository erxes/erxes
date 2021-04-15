import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface IFlowActionType {
  type?: string;
  name?: string;
  description?: string;
}

export interface IFlowActionTypeDocument extends IFlowActionType, Document {
  _id: string;
  createdAt: Date;
}

// Mongoose schemas ===========

export const flowActionTypeSchema = new Schema({
  _id: field({ pkey: true }),
  type: field({ type: String, label: 'Type' }),
  name: field({ type: String, label: 'Name' }),
  description: field({ type: String, optional: true, label: 'Description' }),
  createdAt: field({ type: Date, label: 'Created at' }),
});
