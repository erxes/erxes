import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';
import { IFlow, IFlowDocument } from './flows';

export interface IProcess {
  flowId: string;
  flow: IFlowDocument;
  dueDate: Date;
  branchId: string;
  departmentId: string;
  productId: string;
  uomId?: string;
  quantity: number;
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
    dueDate: field({ type: Date, label: 'date' }),
    productId: field({
      type: String,
      label: 'Product',
      optional: true,
      index: true
    }),
    quantity: field({ type: Number, label: 'quantity' }),
    status: field({ type: String, label: 'Status' }),
    isSub: field({ type: Boolean, optional: true, label: 'Is Sub Process' }),
    createdAt: { type: Date, default: new Date(), label: 'Created date' },
    createdBy: { type: String },
    updatedAt: { type: Date, default: new Date(), label: 'Updated date' },
    updatedBy: { type: String },
    referInfos: field({ type: Object, optional: true, label: 'Jobs' }),
    branchId: { type: String, optional: true },
    departmentId: { type: String, optional: true }
  }),
  'erxes_processes'
);

// for tags query. increases search speed, avoids in-memory sorting
processSchema.index({ status: 1 });
