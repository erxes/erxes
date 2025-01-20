import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface IConfig {
  code: string;
  value: string;
  pipelineId: string;
}

export interface IConfigDocument extends IConfig, Document {
  _id: string;
}

// Mongoose schemas ===========

export const configSchema = new Schema({
  _id: field({ pkey: true }),
  code: field({ type: String, unique: true, label: 'Code' }),
  value: field({ type: Object, label: 'Value' }),
  pipelineId: field({ type: String, label: 'pipelineId' }),
});
