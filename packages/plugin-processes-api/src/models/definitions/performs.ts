import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';
import { IProductsData, productsDataSchema } from './jobs';
import { JOB_TYPES } from './constants';

export interface IPerform {
  overallWorkId?: string;
  overallWorkKey: any;
  status: string;
  startAt: Date;
  dueDate: Date;
  endAt: Date;
  count: number;
  description?: string;
  appendix?: string;
  assignedUserIds: string[];
  customerId?: string;
  companyId?: string;
  inBranchId?: string;
  inDepartmentId?: string;
  outBranchId?: string;
  outDepartmentId?: string;
  needProducts: IProductsData[];
  resultProducts: IProductsData[];
  inProducts: IProductsData[];
  outProducts: IProductsData[];
}

export interface IPerformDocument extends IPerform, Document {
  _id: string;
  createdAt: Date;
  createdBy: string;
  modifiedAt: Date;
  modifiedBy: string;
}

export const performSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    overallWorkId: field({
      type: String,
      optional: true,
      label: 'overall work id'
    }),
    overallWorkKey: field({ type: Object, label: 'overall work key' }),
    status: field({ type: String, label: 'Status' }),
    startAt: field({ type: Date, optional: true, label: 'Start at' }),
    dueDate: field({ type: Date, optional: true, label: 'Due at' }),
    endAt: field({ type: Date, optional: true, label: 'End at' }),
    count: field({ type: Number, label: 'Count' }),
    type: field({
      type: String,
      enum: JOB_TYPES.ALL,
      label: 'Type'
    }),
    typeId: field({ type: String, label: 'jobId' }), // jobReferId || productId || ~subFlowId
    inBranchId: field({ type: String, optional: true, label: 'in Branch' }),
    inDepartmentId: field({
      type: String,
      optional: true,
      label: 'in Department'
    }),
    outBranchId: field({ type: String, optional: true, label: 'out Branch' }),
    outDepartmentId: field({
      type: String,
      optional: true,
      label: 'out Department'
    }),
    needProducts: field({ type: [productsDataSchema], label: 'Need products' }),
    resultProducts: field({
      type: [productsDataSchema],
      label: 'Result products'
    }),
    inProducts: field({ type: [productsDataSchema], label: 'Need products' }),
    outProducts: field({
      type: [productsDataSchema],
      label: 'Result products'
    }),
    description: field({ type: String, optional: true, label: 'description' }),
    appendix: field({ type: String, optional: true, label: 'appendix' }),
    assignedUserIds: field({
      type: [String],
      optional: true,
      label: 'assignedUserIds'
    }),
    customerId: field({ type: String, optional: true, label: 'customerId' }),
    companyId: field({ type: String, optional: true, label: 'companyId' }),
    createdAt: field({
      type: Date,
      default: new Date(),
      label: 'Created date'
    }),
    createdBy: field({ type: String, label: 'Created User' }),
    modifiedAt: field({
      type: Date,
      default: new Date(),
      label: 'Modified date'
    }),
    modifiedBy: field({ type: String, label: 'Modified User' })
  }),
  'erxes_performs'
);

// for performSchema query. increases search speed, avoids in-memory sorting
performSchema.index({ status: 1 });
