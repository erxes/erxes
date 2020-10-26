import { Document, Schema } from 'mongoose';
import { commonItemFieldsSchema, IItemCommonFields } from './boards';
import { schemaWrapper } from './utils';

export interface ITaskDocument extends IItemCommonFields, Document {
  _id: string;
}

// Mongoose schemas =======================
export const taskSchema = schemaWrapper(
  new Schema({
    ...commonItemFieldsSchema,
  }),
);
