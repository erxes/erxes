import { Schema, Document } from 'mongoose';
import { LOG_TYPES } from '../../constants';

import { field } from './utils';

export interface ILog {
  type: string;
  value: any;
  specialValue: any;
  createdAt: Date;
}

export interface ILogInput {
  type: string;
  value: any;
  specialValue: any;
}

export interface ILogDocument extends ILog, Document {
  _id: string;
}

export const logSchema = new Schema({
  _id: field({ pkey: true }),
  type: field({ type: String, enum: LOG_TYPES.ALL }),
  value: field({ type: Object }),
  specialValue: field({ type: String }),
  createdAt: field({ type: Date })
});
