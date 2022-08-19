import { Document, Schema } from 'mongoose';
import { productsDataSchema } from './jobs';
import { field, schemaHooksWrapper } from './utils';

export interface IWork {
  name?: string;
  status: string;
  dueDate: Date;
  startAt: Date;
  endAt: Date;
  jobId: string;
  flowId: string;
  productId: string;
  count: string;
  intervalId?: string;
  inBranchId?: string;
  inDepartmentId?: string;
  outBranchId?: string;
  outDepartmentId?: string;
  needProducts?: any[];
  resultProducts?: any[];
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
    name: field({ type: String, optional: true, label: 'Name' }),
    status: field({ type: String, label: 'Status' }),
    jobId: field({ type: String, label: 'jobId' }),
    flowId: field({ type: String, label: 'flowId' }),
    productId: field({ type: String, label: 'productId' }),
    count: field({ type: String, label: 'count' }),
    intervalId: field({ type: String, label: 'Interval Id' }),
    inBranchId: field({ type: String, optional: true, label: 'branchId' }),
    inDepartmentId: field({
      type: String,
      optional: true,
      label: 'departmentId'
    }),
    outBranchId: field({ type: String, optional: true, label: 'branchId' }),
    outDepartmentId: field({
      type: String,
      optional: true,
      label: 'departmentId'
    }),
    needProducts: field({
      type: [productsDataSchema],
      optional: true,
      label: 'Need products'
    }),
    resultProducts: field({
      type: [productsDataSchema],
      optional: true,
      label: 'Result products'
    }),
    createdAt: field({
      type: Date,
      default: new Date(),
      label: 'Created date'
    }),
    dueDate: field({ type: Date, label: 'Due Date' }),
    startAt: field({ type: Date, optional: true, label: 'Start at' }),
    endAt: field({ type: Date, optional: true, label: 'End at' })
  }),
  'erxes_works'
);

// for workSchema query. increases search speed, avoids in-memory sorting
workSchema.index({ status: 1 });
