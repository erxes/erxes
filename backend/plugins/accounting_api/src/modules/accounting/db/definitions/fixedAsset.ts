import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import {
  ADJ_FXA_STATUSES,
  DEFERRED_TAX_TYPES,
} from '../../@types/adjustFixedAsset';

export const adjustFixedAssetSchema = new Schema({
  _id: mongooseStringRandomId,
  date: { type: Date, label: 'Date', index: true },
  description: { type: String, label: 'Description' },
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
  fxaInstanceId: { type: String, label: 'Fixed asset instance', index: true },
  fixedAssetId: { type: String, optional: true, label: 'Fixed asset' },
  categoryId: { type: String, optional: true, label: 'Category' },
  accountId: { type: String, optional: true, label: 'Account' },
  branchId: { type: String, optional: true, label: 'Branch', index: true },
  departmentId: {
    type: String,
    optional: true,
    label: 'Department',
    index: true,
  },
  originalCost: { type: Number, label: 'Original cost' },
  salvageValue: { type: Number, optional: true, label: 'Salvage value' },
  openingBookValue: {
    type: Number,
    optional: true,
    label: 'Opening book value',
  },
  openingAccumulatedDepreciation: {
    type: Number,
    optional: true,
    label: 'Opening accumulated depreciation',
  },
  depreciationAmount: {
    type: Number,
    optional: true,
    label: 'Depreciation amount',
  },
  // Санхүүгийн бүртгэлд journal үүсгэх элэгдлийн дүн
  bookDepreciationAmount: {
    type: Number,
    optional: true,
    label: 'Book depreciation amount',
  },
  closingAccumulatedDepreciation: {
    type: Number,
    optional: true,
    label: 'Closing accumulated depreciation',
  },
  closingBookValue: {
    type: Number,
    optional: true,
    label: 'Closing book value',
  },
  // Хугацааны эхний татварын суурь
  openingTaxBase: {
    type: Number,
    optional: true,
    label: 'Opening tax base',
  },
  // Хугацааны эхний татварын хуримтлагдсан элэгдэл
  openingTaxAccumulatedDepreciation: {
    type: Number,
    optional: true,
    label: 'Opening tax accumulated depreciation',
  },
  // Татварын тайланд зөвшөөрөгдөх элэгдлийн дүн
  taxDepreciationAmount: {
    type: Number,
    optional: true,
    label: 'Tax depreciation amount',
  },
  // Хугацааны эцсийн татварын хуримтлагдсан элэгдэл
  closingTaxAccumulatedDepreciation: {
    type: Number,
    optional: true,
    label: 'Closing tax accumulated depreciation',
  },
  // Хугацааны эцсийн татварын суурь
  closingTaxBase: {
    type: Number,
    optional: true,
    label: 'Closing tax base',
  },
  // Хугацааны эхний book value ба tax base-ийн түр зөрүү
  openingTemporaryDifference: {
    type: Number,
    optional: true,
    label: 'Opening temporary difference',
  },
  // Энэ хаалтаар шинээр үүссэн түр зөрүүний өөрчлөлт
  temporaryDifferenceAmount: {
    type: Number,
    optional: true,
    label: 'Temporary difference amount',
  },
  // Хугацааны эцсийн book value ба tax base-ийн түр зөрүү
  closingTemporaryDifference: {
    type: Number,
    optional: true,
    label: 'Closing temporary difference',
  },
  // Түр зөрүүнээс тооцсон deferred tax дүн
  deferredTaxAmount: {
    type: Number,
    optional: true,
    label: 'Deferred tax amount',
  },
  // Deferred tax asset эсвэл liability гэдгийг тэмдэглэнэ
  deferredTaxType: {
    type: String,
    optional: true,
    enum: DEFERRED_TAX_TYPES.ALL,
    label: 'Deferred tax type',
  },
  // Deferred tax бүртгэсэн transaction
  deferredTaxTransactionId: {
    type: String,
    optional: true,
    label: 'Deferred tax transaction',
  },
  // Deferred tax бүртгэсэн transaction detail
  deferredTaxTrDetailId: {
    type: String,
    optional: true,
    label: 'Deferred tax transaction detail',
  },
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

adjustFxaDetailSchema.index({ adjustId: 1, fxaInstanceId: 1 });
adjustFxaDetailSchema.index({ adjustId: 1, branchId: 1, departmentId: 1 });
