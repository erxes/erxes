import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';
import { IProductsData, productsDataSchema } from './jobs';

export interface IPerform {
  overallWorkId: string;
  status: string;
  needProducts: IProductsData;
  resultProducts: IProductsData;
}

export interface IPerformDocument extends IPerform, Document {
  _id: string;
  createdAt: Date;
  createdBy: string;
}

export const performSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    createdAt: { type: Date, default: new Date(), label: 'Created date' },
    createdBy: { type: String, label: 'Created User' },
    status: field({ type: String, label: 'Status' }),
    startAt: field({ type: Date, optional: true, label: 'Start at' }),
    endAt: field({ type: Date, optional: true, label: 'End at' }),

    overallWorkId: { type: String },

    needProducts: field({ type: productsDataSchema, label: 'Need products' }),
    resultProducts: field({
      type: productsDataSchema,
      label: 'Result products'
    })
  }),
  'erxes_performs'
);

// for performSchema query. increases search speed, avoids in-memory sorting
performSchema.index({ status: 1 });
