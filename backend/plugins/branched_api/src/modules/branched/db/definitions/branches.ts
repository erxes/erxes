import { schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

export const branchSchema = schemaWrapper(
  new Schema(
    {
      name: { type: String, required: true, label: 'Name' },
      address: { type: String, optional: true, label: 'Address' },
      phone: { type: String, optional: true, label: 'Phone' },
      email: { type: String, optional: true, label: 'Email' },
      managerId: { type: String, optional: true, esType: 'keyword' },
      employeeIds: { type: [String], optional: true, esType: 'keyword' },
      isActive: { type: Boolean, default: true, label: 'Is active' },
      code: { type: String, optional: true, label: 'Code' },
      description: { type: String, optional: true, label: 'Description' },
      order: { type: Number, optional: true, label: 'Order' },
      parentId: { type: String, optional: true, esType: 'keyword' },
      supervisorId: { type: String, optional: true, esType: 'keyword' },
    },
    { timestamps: true },
  ),
);
