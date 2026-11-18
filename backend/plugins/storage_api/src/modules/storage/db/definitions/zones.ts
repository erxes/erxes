import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

/** An inventory account at a branch and department. */
export const zoneLocationSchema = new Schema(
  {
    accountId: { type: String, required: true, label: 'Inventory account' },
    branchId: { type: String, required: true, label: 'Branch' },
    departmentId: { type: String, required: true, label: 'Department' },
  },
  { _id: false },
);

export const zoneSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    name: { type: String, required: true, unique: true, label: 'Name' },
    sealed: { type: zoneLocationSchema, required: true, label: 'Sealed (RFID) location' },
    open: { type: zoneLocationSchema, required: true, label: 'Open location' },
  },
  { timestamps: true },
);
