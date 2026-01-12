import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';
import { Document, Schema } from 'mongoose';

export interface IConfig {
  code: string;
  value: any;
}

export interface IConfigDocument extends IConfig, Document {
  _id: string;
}

export interface ISESConfig {
  accessKeyId: string;
  region: string;
  secretAccessKey: string;
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
