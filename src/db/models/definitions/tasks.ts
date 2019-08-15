import { Document, Schema } from 'mongoose';
import { commonItemFieldsSchema, IItemCommonFields } from './boards';
import { field } from './utils';

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
