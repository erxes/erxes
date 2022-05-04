import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';
import { IProductsData, productsDataSchema } from './jobs';

export interface IYield {
  performId: string;
  needProducts: IProductsData;
  resultProducts: IProductsData;
}

export interface IYieldDocument extends IYield, Document {
  _id: string;
  createdAt: Date;
  createdBy: string;
}

export const yieldsSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    createdAt: { type: Date, default: new Date(), label: 'Created date' },
    createdBy: { type: String, label: 'Created User' },

    startAt: field({ type: Date, optional: true, label: 'Start at' }),
    endAt: field({ type: Date, optional: true, label: 'End at' }),

    performId: { typd: String },

    needProducts: field({ type: productsDataSchema, label: 'Need products' }),
    resultProducts: field({ type: productsDataSchema, label: 'Result products' }),
  }),
  'erxes_performs'
);

// for yieldsSchema query. increases search speed, avoids in-memory sorting
yieldsSchema.index({ status: 1 });


