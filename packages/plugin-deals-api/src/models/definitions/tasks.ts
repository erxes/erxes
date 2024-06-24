import { Document, Schema } from 'mongoose';
import { commonItemFieldsSchema, IItemCommonFields } from './boards';

export interface ITaskDocument extends IItemCommonFields, Document {
  _id: string;
}

// Mongoose schemas =======================
export const taskSchema = new Schema({
  ...commonItemFieldsSchema
});
