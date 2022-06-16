import { Document, Schema } from 'mongoose';
// import { DURATION_TYPES } from './constants';
import { field, schemaHooksWrapper } from './utils';
// import { IJobRefer, jobReferSchema, productsDataSchema } from './jobs';

export interface IWork {
  name: string;
  status: string;
  jobId: string;
  flowId: string;
  productId: string;
  count: string;
  branchId: string;
  departmentId: string;
}

export interface IWorkDocument extends IWork, Document {
  _id: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

export const workSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' }),
    status: field({ type: String, label: 'Status' }),
    jobId: field({ type: String, label: 'jobId' }),
    flowId: field({ type: String, label: 'flowId' }),
    productId: field({ type: String, label: 'productId' }),
    count: field({ type: String, label: 'count' }),
    branchId: field({ type: String, label: 'branchId' }),
    departmentId: field({ type: String, label: 'departmentId' }),

    // processId: field({ type: String }),
    // performId: field({ type: String }),

    createdAt: { type: Date, default: new Date(), label: 'Created date' }

    // dueDate: field({ type: Date, label: 'Due Date' }),
    // startAt: field({ type: Date, optional: true, label: 'Start at' }),
    // endAt: field({ type: Date, optional: true, label: 'End at' }),
    // quantity: field({ type: Number, label: 'Quantity' }),
  }),
  'works'
);

// for workSchema query. increases search speed, avoids in-memory sorting
workSchema.index({ status: 1 });
