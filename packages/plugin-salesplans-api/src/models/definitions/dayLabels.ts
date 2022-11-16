import { Document, Schema } from 'mongoose';
import { field, schemaWrapper } from './utils';

export interface IDayLabelsAddParams {
  dates: string[];
  departmentIds: string[];
  branchIds: string[];
  labelIds: string[];
}

export interface IDayLabel {
  date: Date;
  departmentId: string;
  branchId: string;
  labelIds: string[];
}

export interface IDayLabelDocument extends IDayLabel, Document {
  _id: string;
  createdAt?: Date;
  createdBy?: string;
  modifiedAt?: Date;
  modifiedBy?: string;
  confirmedData?: any;
}

export const dayLabelSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    date: field({ type: Date, label: 'Year' }),
    departmentId: field({ type: String, label: 'Department' }),
    branchId: field({ type: String, label: 'Branch' }),
    labelIds: field({ type: [String], label: '' }),
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
