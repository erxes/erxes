import { Document, Schema } from 'mongoose';
import { JOB_CATEGORY_STATUSES } from './constants';
import { field, schemaWrapper } from './utils';

export interface IJobCategory {
  name: string;
  code: string;
  description?: string;
  parentId?: string;
  attachment?: any;
  status?: string;
}

export interface IJobCategoryDocument extends IJobCategory, Document {
  _id: string;
  order: string;
  createdAt: Date;
}

export const jobCategorySchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' }),
    code: field({ type: String, unique: true, label: 'Code' }),
    order: field({ type: String, label: 'Order' }),
    parentId: field({ type: String, optional: true, label: 'Parent' }),
    description: field({ type: String, optional: true, label: 'Description' }),
    status: field({
      type: String,
      enum: JOB_CATEGORY_STATUSES.ALL,
      optional: true,
      label: 'Status',
      default: 'active',
      esType: 'keyword',
      index: true
    }),
    createdAt: field({
      type: Date,
      default: new Date(),
      label: 'Created at'
    })
  })
);
