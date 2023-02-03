import { Schema, Document } from 'mongoose';
import { field } from './utils';

export interface IOperations extends Document {
  name: string;
  description: string;
  code: string;
  order: string;
  createdAt: string;
  modifiedAt: string;
}

export interface IOperationsDocument extends IOperations {
  _id: string;
}

export const operationSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Name' }),
  description: field({ type: String, label: 'Description' }),
  parentId: field({ type: String, label: 'Parent Id', optional: true }),
  code: field({ type: String, label: 'Code' }),
  order: field({ type: String, label: 'Order' }),
  createdAt: field({ type: Date, label: 'Created At', default: Date.now }),
  modifiedAt: field({ type: Date, label: 'Modified At', default: Date.now }),
  teamMemberIds: field({ type: [String], label: 'User Id' })
});
