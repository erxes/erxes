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

export interface IProcess {
  name: string;
  categoryId: string;
  status: string;
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
);

export const processSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    flowId: field({ type: String }),
    status: field({ type: String, label: 'Status' }),
    createdAt: { type: Date, default: new Date(), label: 'Created date' },

    jobs: field({ type: jobSchema, label: 'Jobs' }),

    dueDate: field({ type: Date, label: 'Due Date' }),
    startAt: field({ type: Date, optional: true, label: 'Start at' }),
    endAt: field({ type: Date, optional: true, label: 'End at' }),
    quantity: field({ type: Number, label: 'Quantity' }),

    // realization
    assignedUserIds: field({ type: [String], label: 'Assigned users' }),
    duration: field({ type: Number, label: 'Duration value' }),
    durationType: field({
      type: String,
      enum: DURATION_TYPES.ALL,
      default: DURATION_TYPES.HOUR,
      label: 'Duration value'
    }),
    needProducts: field({ type: productsDataSchema, label: 'Need products' }),
    resultProducts: field({
      type: productsDataSchema,
      label: 'Result products'
    })
  }),
  'erxes_flows'
);

// for processSchema query. increases search speed, avoids in-memory sorting
processSchema.index({ status: 1 });
