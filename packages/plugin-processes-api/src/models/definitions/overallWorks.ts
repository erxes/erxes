import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';
import { IProductsData, productsDataSchema } from './jobs';

export interface IOverallWork {
  status: string;
  dueDate: Date;
  startAt: Date;
  endAt: Date;
  assignUserIds: string[];
  jobId: string;
  flowId: string;
  outBranchId: string;
  outDepartmentId: string;
  inBranchId: string;
  inDepartmentId: string;
  needProducts: IProductsData[];
  resultProducts: IProductsData[];
}

export interface IOverallWorkDocument extends IOverallWork, Document {
  _id: string;
  createdAt: Date;
  createdBy: string;
}

export const overallWorkSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    status: field({ type: String, label: 'Status' }),
    createdAt: { type: Date, default: new Date(), label: 'Created date' },
    createdBy: { type: String, label: 'Created User' },

    dueDate: field({ type: Date, label: 'Due Date' }),
    startAt: field({ type: Date, optional: true, label: 'Start at' }),
    endAt: field({ type: Date, optional: true, label: 'End at' }),

    assignUserIds: { type: [String] },
    outBranchId: { type: String },
    outDepartmentId: { type: String },
    inBranchId: { type: String },
    inDepartmentId: { type: String },

    needProducts: field({ type: [productsDataSchema], label: 'Need products' }),
    resultProducts: field({
      type: [productsDataSchema],
      label: 'Result products'
    })
  }),
  'erxes_overallWorks'
);

// for overallWorkSchema query. increases search speed, avoids in-memory sorting
overallWorkSchema.index({ status: 1 });
