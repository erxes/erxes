import { field, schemaWrapper } from './utils';
import { Schema, Document } from 'mongoose';
import { STATUS } from '../../constants';

export interface ILabel {
  title: string;
  color: string;
  type: string;
  status: string;
}

export interface ILabelDocument extends ILabel, Document {
  _id: string;
}

export const labelSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    title: field({ type: String, label: 'Title' }),
    color: field({ type: String, label: 'Color' }),
    type: field({ type: String, label: 'Type' }),
    status: field({
      type: String,
      enum: STATUS.ALL,
      default: 'active',
      label: 'Status'
    })
  })
);
