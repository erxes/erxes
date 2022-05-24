import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export const safeRemItemSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    remainderId: field({ type: String }),
    status: field({ type: String, label: 'Status' }),
    modifiedAt: field({
      type: Date,
      default: new Date(),
      label: 'Modified date'
    }),

    productId: field({ type: String, index: true }),
    count: field({ type: Number, label: 'Remainder count' }),

    branchId: field({ type: String, label: 'Branch' }),
    departmentId: field({ type: String, label: 'Department' })
  }),
  'erxes_rem_items'
);

export const remainderSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true })
  }),
  'erxes_remainders'
);

// for safeRemItemSchema query. increases search speed, avoids in-memory sorting
safeRemItemSchema.index({
  isDebit: 1,
  productId: 1,
  branchId: 1,
  departmentId: 1
});
