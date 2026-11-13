import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import { ADJ_FXA_STATUSES } from '../../@types/adjustFixedAsset';

export const adjustFixedAssetSchema = new Schema({
  _id: mongooseStringRandomId,
  date: { type: Date, label: 'Date', index: true },
  description: { type: String, label: 'Description' },
  expenseAccountId: {
    type: String,
    optional: true,
    label: 'Depreciation expense account',
  },
  taxExpenseAccountId: {
    type: String,
    optional: true,
    label: 'Income tax expense account',
  },
  status: {
    type: String,
    default: ADJ_FXA_STATUSES.DRAFT,
    enum: ADJ_FXA_STATUSES.ALL,
    label: 'Status',
    index: true,
  },
  error: { type: String, optional: true, label: 'Error' },
  warning: { type: String, optional: true, label: 'Warning' },
  beginDate: { type: Date, optional: true, label: 'Begin date' },
  checkedAt: { type: Date, optional: true, label: 'Checked at' },
  successDate: { type: Date, optional: true, label: 'Success date' },
  createdBy: { type: String, optional: true, label: 'Created user' },
  modifiedBy: { type: String, optional: true, label: 'Modified user' },
  createdAt: { type: Date, default: Date.now, label: 'Created at' },
  updatedAt: { type: Date, optional: true, label: 'Modified at' },
});

export const adjustFxaDetailSchema = new Schema({
  _id: mongooseStringRandomId,
  adjustId: { type: String, label: 'Adjust fixed asset', index: true },
  fixedAssetId: { type: String, optional: true, label: 'Fixed asset' },
  categoryId: { type: String, optional: true, label: 'Category' },
  accountId: { type: String, optional: true, label: 'Account' },
  branchId: { type: String, default: '', label: 'Branch', index: true },
  departmentId: {
    type: String,
    optional: true,
    label: 'Department',
    default: '',
    index: true,
  },
  count: { type: Number, default: 0 },
  originalCost: { type: Number, label: 'Original cost' },
  salvageValue: { type: Number, default: 0, label: 'Salvage value' },
  accumulatedDepreciation: {
    type: Number,
    default: 0,
    label: 'Accumulated depreciation',
  },
  depreciationAmount: {
    type: Number,
    default: 0,
    label: 'Period depreciation',
  },
  taxDepreciationAmount: { type: Number, optional: true },
  taxAccumulatedDepreciation: { type: Number, optional: true },
  revaluationLoss: { type: Number, default: 0 },
  revaluationReserve: { type: Number, default: 0 },
  transactionId: { type: String, optional: true, label: 'Transaction' },
  transactionDetailId: {
    type: String,
    optional: true,
    label: 'Transaction detail',
  },
  error: { type: String, optional: true, label: 'Error' },
  warning: { type: String, optional: true, label: 'Warning' },
  createdAt: { type: Date, default: Date.now, label: 'Created at' },
  updatedAt: { type: Date, optional: true, label: 'Modified at' },
});

adjustFxaDetailSchema.index(
  { adjustId: 1, fixedAssetId: 1, branchId: 1, departmentId: 1 },
  { unique: true },
);
adjustFxaDetailSchema.index({ adjustId: 1, branchId: 1, departmentId: 1 });
