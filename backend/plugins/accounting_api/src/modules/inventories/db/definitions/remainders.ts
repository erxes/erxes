import { Schema } from 'mongoose';
import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';

export const remainderSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    branchId: { type: String, default: '', label: 'Branch' },
    departmentId: { type: String, default: '', label: 'Department' },

    status: { type: String, label: 'Status' },
    productId: { type: String, index: true },
    count: { type: Number, label: 'Count' },
    soonIn: { type: Number, optional: true, label: 'Soon In' },
    soonOut: { type: Number, optional: true, label: 'Soon Out' },

    modifiedAt: {
      type: Date,
      default: new Date(),
      label: 'Modified date',
    },
    shortLogs: { type: [Object] },
  }),
);

// for remainderSchema query. increases search speed, avoids in-memory sorting
remainderSchema.index({
  isDebit: 1,
  productId: 1,
  branchId: 1,
  departmentId: 1,
});
