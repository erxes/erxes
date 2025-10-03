import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';
import { Document, Schema } from 'mongoose';

export interface IConfig {
  code: string;
  value: any;
}

export interface IConfigDocument extends IConfig, Document {
  _id: string;
}

// Mongoose schemas ===========

export const configSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    code: {
      type: String,
      unique: true,
      label: 'Code',
    },
    value: {
      type: Object,
      label: 'Value',
    },
  }),
);
