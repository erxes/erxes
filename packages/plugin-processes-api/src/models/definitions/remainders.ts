import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';
import { IProductsData } from './jobs';

export interface ITransaction {
  productId: string;
  quantity: number;
  uomId: string;
  count: number;
  branchId: string;
  departmentId: string;
}

export interface ITransactionDocument extends ITransaction, Document {
  _id: string;
  modifiedAt: Date;
}

export const remaindersSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    modifiedAt: { type: Date, default: new Date(), label: 'Modified date' },

    productId: { type: String, index: true },
    quantity: field({ type: Number, label: 'Quantity' }),
    uomId: field({ type: String, label: 'UOM' }),

    count: field({ type: Number, label: 'Main count' }),

    branchId: field({ type: String, label: 'Branch' }),
    departmentId: field({ type: String, label: 'Department' }),
  }),
  'erxes_transactions'
);

// for remaindersSchema query. increases search speed, avoids in-memory sorting
remaindersSchema.index({
  isDebit: 1,
  productId: 1,
  branchId: 1,
  departmentId: 1
});



