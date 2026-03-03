import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

export const reserveRemSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    departmentId: { type: String, label: 'Department' },
    branchId: { type: String, label: 'Branch' },
    productId: { type: String, label: 'product' },
    uom: { type: String, label: 'Uom' },
    remainder: { type: Number, label: 'Remainder' },
    createdAt: { type: Date, default: new Date(), label: 'Created at' },
    createdBy: { type: String, label: 'Created by' },
    modifiedAt: {
      type: Date,
      default: new Date(),
      label: 'Modified at',
    },
    modifiedBy: { type: String, label: 'Modified by' },
  }),
);
