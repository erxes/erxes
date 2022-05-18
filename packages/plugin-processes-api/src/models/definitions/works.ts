import { Document, Schema } from 'mongoose';
import { DURATION_TYPES } from './constants';
import { field, schemaHooksWrapper } from './utils';
import { IJobRefer, jobReferSchema, productsDataSchema } from './jobs';

export interface IJob {
  id: string;
  nextJobIds: string[];
  jobRefer: IJobRefer;
  style: { type: object };
  label: { type: string; optional: true };
  description: { type: string; optional: true };
  quantity: { type: number };
}

export interface IWork {
  name: string;
  categoryId: string;
  status: string;
  jobs: IJob[];
}

export interface IWorkDocument extends IWork, Document {
  _id: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

export const jobSchema = new Schema(
  {
    id: { type: String, required: true },
    nextJobIds: { type: [String] },
    jobRefer: { type: jobReferSchema },
    style: { type: Object },
    label: { type: String, optional: true },
    description: { type: String, optional: true },
    quantity: { type: Number }
  },
  { _id: false }
);

export const workSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    jobId: field({ type: String }),
    flowId: field({ type: String }),
    processId: field({ type: String }),
    performId: field({ type: String }),

    createdAt: { type: Date, default: new Date(), label: 'Created date' },

    status: field({ type: String, label: 'Status' })

    // dueDate: field({ type: Date, label: 'Due Date' }),
    // startAt: field({ type: Date, optional: true, label: 'Start at' }),
    // endAt: field({ type: Date, optional: true, label: 'End at' }),
    // quantity: field({ type: Number, label: 'Quantity' }),
  }),
  'erxes_flows'
);

// for workSchema query. increases search speed, avoids in-memory sorting
workSchema.index({ status: 1 });
