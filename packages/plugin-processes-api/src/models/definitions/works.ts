import { Document, Schema } from 'mongoose';
import { DURATION_TYPES } from './constants';
import { field, schemaHooksWrapper } from './utils';
import { IJobRefer, jobReferSchema, productsDataSchema } from './jobs';

export interface IJob {
  id: string;
  nextJobIds: string[];
  jobRefer: IJobRefer,
  style: { type: Object },
  label: { type: String, optional: true },
  description: { type: String, optional: true },
  quantity: { type: Number }
}

export interface IProcess {
  name: String;
  categoryId: String;
  status: String;
  jobs: IJob[];
}

export interface IProcessDocument extends IProcess, Document {
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
)

export const worksSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    jobId: field({ type: String }),
    flowId: field({ type: String }),
    processId: field({ type: String }),
    performId: field({ type: String }),

    createdAt: { type: Date, default: new Date(), label: 'Created date' },

    status: field({ type: String, label: 'Status' }),


    // dueDate: field({ type: Date, label: 'Due Date' }),
    // startAt: field({ type: Date, optional: true, label: 'Start at' }),
    // endAt: field({ type: Date, optional: true, label: 'End at' }),
    // quantity: field({ type: Number, label: 'Quantity' }),

  }),
  'erxes_flows'
);

// for worksSchema query. increases search speed, avoids in-memory sorting
worksSchema.index({ status: 1 });


