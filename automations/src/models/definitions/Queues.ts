import { Document, Schema } from 'mongoose';
import { QUEUE_STATUS } from './constants';
import { field } from './utils';

export interface IQueue {
  createdAt?: Date;
  createdBy?: string;
  nextAt?: Date;
  shapeId: string;
  postData: any;
  status: string;
  parentId?: string;
}

export interface IQueueDocument extends IQueue, Document {
  _id: string;
}

export const queueSchema = new Schema({
  _id: field({ pkey: true }),
  createdAt: field({ type: Date, label: 'Created at' }),
  createdBy: field({ type: String, label: 'Created by' }),
  nextAt: field({ type: Date, label: 'Next at' }),
  shapeId: field({ type: String, label: 'Shape', index: true }),
  postData: field({ type: Object, optional: true }),
  status: field({
    type: String,
    enum: QUEUE_STATUS.ALL,
    label: 'Status',
    index: true,
  }),
  parentId: field({ type: String, label: 'parentId', index: true }),
});
