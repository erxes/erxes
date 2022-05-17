import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';
import { IProductsData } from './jobs';

export interface IRemainder {
  productId: string;
  quantity: number;
  uomId: string;
  count: number;
  branchId: string;
  departmentId: string;
}

export interface IRemainderDocument extends IRemainder, Document {
  _id: string;
  modifiedAt: Date;
}

export const remainderSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    status: field({ type: String, label: 'Status' }),
    modifiedAt: { type: Date, default: new Date(), label: 'Modified date' },

    productId: { type: String, index: true },
    quantity: field({ type: Number, label: 'Quantity' }),
    uomId: field({ type: String, label: 'UOM' }),

    count: field({ type: Number, label: 'Main count' }),

    branchId: field({ type: String, label: 'Branch' }),
    departmentId: field({ type: String, label: 'Department' })
  }),
  'erxes_transactions'
);

// for remainderSchema query. increases search speed, avoids in-memory sorting
remainderSchema.index({
  isDebit: 1,
  productId: 1,
  branchId: 1,
  departmentId: 1
});
