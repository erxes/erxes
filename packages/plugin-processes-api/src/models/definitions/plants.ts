import { Document, Schema } from 'mongoose';
import { DURATION_TYPES } from './constants';
import { field, schemaHooksWrapper } from './utils';

export interface IProductsData {
  productId: string;
  quantity: number;
  uimId: string;
  branchId: string;
}

export interface IProductsDataDocument extends IProductsData, Document {
  _id: string;
}

export interface IJob {
  code: string;
  name: string;
  type: string;
  status: string;
  createdAt: Date;
  prePlantIds: string[];
  assignedUserIds: string[];
  duration: number;
  durationType: string;
  needProducts: IProductsData;
  resultProducts: IProductsData;
}

export interface IJobDocument extends IJob, Document {
  _id: string;
  createdAt: Date;
  needProducts: IProductsDataDocument;
  resultProducts: IProductsDataDocument;
}

export const productsDataSchema = new Schema({
  _id: field({ pkey: true }),
  productId: field({ type: String, label: 'Product' }),
  quantity: field({ type: Number, label: 'Quantity' }),
  uomId: field({ type: String, label: 'UOM' }),
  branchId: field({ type: String, label: 'UOM' }),
})

export const jobSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    code: field({ type: String, label: 'Code', index: true }),
    name: field({ type: String, label: 'Name' }),
    type: field({ type: String, label: 'Type' }),
    status: field({ type: String, label: 'Status' }),
    createdAt: field({ type: Date, label: 'Created at' }),
    prePlantIds: field({ type: [String], label: 'Previous plants' }),
    assignedUserIds: field({ type: [String], label: 'Assigned users' }),
    duration: field({ type: Number, label: 'Duration value' }),
    durationType: field({
      type: String, enum: DURATION_TYPES.ALL,
      default: DURATION_TYPES.HOUR, label: 'Duration value'
    }),
    needProducts: field({ type: productsDataSchema, label: 'Need products' }),
    resultProducts: field({ type: productsDataSchema, label: 'Result products' }),

  }),
  'erxes_jobs'
);

// for tags query. increases search speed, avoids in-memory sorting
jobSchema.index({ status: 1 });


