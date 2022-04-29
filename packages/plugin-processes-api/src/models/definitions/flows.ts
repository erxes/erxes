import { Document, Schema } from 'mongoose';
import { DURATION_TYPES } from './constants';
import { field, schemaHooksWrapper } from './utils';
import { jobSchema, productsDataSchema } from './plants';

export interface ITag {
  name: string;
  type: string;
  colorCode?: string;
  objectCount?: number;
  parentId?: string;
}

export interface ITagDocument extends ITag, Document {
  _id: string;
  createdAt: Date;
  order?: string;
  relatedIds?: string[];
}

export const flowTemplateSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    plantId: field({ type: String, optional: true, label: 'Plant' }),
    status: field({ type: String, label: 'Status' }),
    createdAt: field({ type: Date, label: 'Created at' }),
    dueDate: field({ type: Date, label: 'Due Date' }),
    startAt: field({ type: Date, optional: true, label: 'Start at' }),
    endAt: field({ type: Date, optional: true, label: 'End at' }),
    frequency: field({ type: Number, label: 'Frequency count' }),
    currentPlant: field({ type: jobSchema, optional: true, label: 'Current Plant' }),

    // realization
    preFlowIds: field({ type: [String], label: 'Previous plants' }),
    assignedUserIds: field({ type: [String], label: 'Assigned users' }),
    duration: field({ type: Number, label: 'Duration value' }),
    durationType: field({
      type: String, enum: DURATION_TYPES.ALL,
      default: DURATION_TYPES.HOUR, label: 'Duration value'
    }),
    needProducts: field({ type: productsDataSchema, label: 'Need products' }),
    resultProducts: field({ type: productsDataSchema, label: 'Result products' }),
  }),
  'erxes_tags'
);

// for tags query. increases search speed, avoids in-memory sorting
flowTemplateSchema.index({ status: 1 });


