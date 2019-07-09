import { Document, Schema } from 'mongoose';
import { field } from '../utils';
import { commonItemFieldsSchema, IItemCommonFields } from './boards';

export interface ITask extends IItemCommonFields {
  priority?: string;
}

export interface ITaskDocument extends ITask, Document {
  _id: string;
}

// Mongoose schemas =======================
export const taskSchema = new Schema({
  ...commonItemFieldsSchema,

  priority: field({ type: String, optional: true }),
});
