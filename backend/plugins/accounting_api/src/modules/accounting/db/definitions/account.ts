import { Schema } from 'mongoose';
import { ACCOUNT_JOURNALS, ACCOUNT_KINDS, ACCOUNT_STATUSES } from '../../@types/constants';
import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';

export const accountSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    code: { type: String, unique: true, label: 'Code' },
    name: { type: String, label: 'Name' },
    categoryId: { type: String, label: 'Category' },
    parentId: { type: String, optional: true, label: 'Parent' },
    currency: { type: String, label: 'Currency' },
    kind: {
      type: String,
      enum: ACCOUNT_KINDS.ALL,
      default: ACCOUNT_KINDS.ACTIVE,
      label: 'KIND',
    },
    journal: {
      type: String,
      enum: ACCOUNT_JOURNALS.ALL,
      default: ACCOUNT_JOURNALS.MAIN,
      label: 'Journal',
    },
    description: { type: String, optional: true, label: 'Description' },
    branchId: { type: String, optional: true, label: 'Branch' },
    departmentId: { type: String, optional: true, label: 'Department' },
    createdAt: {
      type: Date,
      default: new Date(),
      label: 'Created at',
    },
    status: {
      type: String,
      enum: ACCOUNT_STATUSES.ALL,
      label: 'Status',
      default: 'active',
      esType: 'keyword',
      index: true,
    },
    isTemp: { type: Boolean, default: false, label: 'Is Temp' },
    isOutBalance: { type: Boolean, default: false, label: 'Is Out balance' },
    mergedIds: { type: [String], optional: true },
  })
);
