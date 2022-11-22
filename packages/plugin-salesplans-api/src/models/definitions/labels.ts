import { field, schemaWrapper } from './utils';
import { Schema, Document } from 'mongoose';
import { STATUS } from '../../constants';

export interface ILabel {
  title: string;
  effect: string;
  description?: string;
  multiplier: number;
  color?: string;
  status: string;
  createdAt?: Date;
  createdUser?: string;
  modifiedAt?: Date;
  modifiedUser?: string;
}

export interface ILabelDocument extends ILabel, Document {
  _id: string;
}

export const labelSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    title: field({ type: String, label: 'Title' }),
    color: field({ type: String, default: '#BFBFBF', label: 'Color' }),
    effect: field({ type: String, optional: true, label: 'Effect' }),
    description: field({ type: String, optional: true, label: 'Description' }),
    multiplier: field({ type: Number, default: 1, label: 'Multiplier' }),
    status: field({
      type: String,
      enum: STATUS.ALL,
      default: 'active',
      label: 'Status'
    }),
    createdAt: field({ type: Date, default: new Date(), label: 'Created at' }),
    createdBy: field({ type: String, label: 'Created by' }),
    modifiedAt: field({
      type: Date,
      default: new Date(),
      label: 'Modified at'
    }),
    modifiedBy: field({ type: String, label: 'Modified by' })
  })
);
