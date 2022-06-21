import { field, schemaWrapper } from './utils';
import { Schema, Document } from 'mongoose';

export interface ITimeframe {
  name: string;
  description: string;
  startTime: number;
  endTime: number;
}

export interface ITimeframeDocument extends ITimeframe, Document {
  _id: string;
}

export const timeframeSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' }),
    description: field({ type: String, label: 'Description' }),
    startTime: field({ type: Number, label: 'Start time' }),
    endTime: field({ type: Number, label: 'String' })
  })
);
