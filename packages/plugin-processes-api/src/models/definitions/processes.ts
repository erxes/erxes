import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';
import { IFlow, IFlowDocument } from './flows';

export interface IProcess {
  flowId: string;
  flow: IFlowDocument;
  date: Date;
  branchId: string;
  departmentId: string;
  productId: string;
  uom?: string;
  origin: string;
  status: string;
  isSub: boolean;
  referInfos: any;
}

export interface IProcessDocument extends IProcess, Document {
  _id: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  currentFlow: IFlow;
}

export const processSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    flowId: field({ type: String, label: 'flow' }),
    flow: field({ type: Object, label: 'flow' }),
    date: field({ type: Date, label: 'date' }),
    productId: field({ type: String, label: 'Product', index: true }),
    uom: field({ type: String, label: 'Product', index: true }),
    status: field({ type: String, label: 'Status' }),
    isSub: field({ type: Boolean, optional: true, label: 'Is Sub Process' }),
    createdAt: { type: Date, default: new Date(), label: 'Created date' },
    createdBy: { type: String },
    updatedAt: { type: Date, default: new Date(), label: 'Updated date' },
    updatedBy: { type: String },
    referInfos: field({ type: Object, optional: true, label: 'Jobs' }),
    branchId: { type: String, label: 'Branch' },
    departmentId: { type: String, label: 'Department' },
    origin: field({ type: String, label: 'Origin' })
  }),
  'erxes_processes'
);

// for tags query. increases search speed, avoids in-memory sorting
processSchema.index({ status: 1 });
