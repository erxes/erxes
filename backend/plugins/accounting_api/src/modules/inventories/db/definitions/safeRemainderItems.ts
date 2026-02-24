import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

export const safeRemainderItemSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    branchId: { type: String, default: '', label: 'Branch' },
    departmentId: { type: String, default: '', label: 'Department' },
    remainderId: { type: String, index: true },
    productId: { type: String, index: true },

    preCount: { type: Number, label: 'Pre count' },
    count: { type: Number, label: 'Remainder count' },

    status: { type: String, label: 'Status', enum: ['new', 'checked'] },
    uom: { type: String, label: 'UOM' },
    modifiedAt: {
      type: Date,
      default: new Date(),
      label: 'Modified date'
    },
    modifiedBy: { type: String, label: 'Modified User' },
    order: { type: Number, index: true },
  })
);

// for safeRemainderItemSchema query. increases search speed, avoids in-memory sorting
safeRemainderItemSchema.index({
  remainderId: 1,
  productId: 1,
  branchId: 1,
  departmentId: 1
});
