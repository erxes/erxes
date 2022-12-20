import { Document, Schema } from 'mongoose';
import { JOB_TYPES } from './constants';
import { productsDataSchema } from './jobs';
import { field, schemaHooksWrapper } from './utils';

export interface IWork {
  processId?: string;
  name?: string;
  status: string;
  dueDate: Date;
  startAt: Date;
  endAt: Date;
  type: string;
  typeId: string;
  flowId?: string;
  origin: string;
  count: number;
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
    processId: field({
      type: String,
      optional: true,
      label: 'Process',
      index: true
    }),
    name: field({ type: String, optional: true, label: 'Name' }),
    status: field({ type: String, label: 'Status' }),
    type: field({
      type: String,
      enum: JOB_TYPES.ALL,
      label: 'Type'
    }),
    typeId: field({ type: String, label: 'jobId' }), // jobReferId || productId || ~subFlowId
    jobId: field({ type: String, label: 'jobId' }),
    flowId: field({ type: String, optional: true, label: 'flowId' }),
    count: field({ type: Number, label: 'count' }),
    intervalId: field({ type: String, optional: true, label: 'Interval Id' }),
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
    endAt: field({ type: Date, optional: true, label: 'End at' }),
    origin: field({ type: String, label: 'Origin' })
  }),
  'erxes_works'
);

// for workSchema query. increases search speed, avoids in-memory sorting
workSchema.index({ status: 1 });
