import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import {
  FIXED_ASSET_DEPRECIATION_METHODS,
  FIXED_ASSET_STATUSES,
} from '../../@types/constants';

export const fixedAssetSchema = new Schema({
  _id: mongooseStringRandomId,
  // Үндсэн хөрөнгийн master/card код
  code: { type: String, label: 'Code', index: true },
  // Үндсэн хөрөнгийн master/card нэр
  name: { type: String, label: 'Name' },
  // Харьяалагдах үндсэн хөрөнгийн бүлэг
  categoryId: { type: String, label: 'Fixed asset category', index: true },
  // Үндсэн хөрөнгийн нэмэлт тайлбар
  description: { type: String, optional: true, label: 'Description' },
  // Орлого авахад сонгосон үндсэн хөрөнгийн данс
  accountId: { type: String, optional: true, label: 'Account', index: true },
  // Анх орлогодсон нийт тоо
  count: { type: Number, optional: true, label: 'Count' },
  // Transaction detail-үүдээс сэргээгдсэн одоогийн үлдэгдэл тоо
  currentCount: { type: Number, optional: true, label: 'Current count' },
  // Нэгжийн анхны өртөг
  originalCost: { type: Number, optional: true, label: 'Original cost' },
  // Анх орлогодсон огноо
  acquisitionDate: {
    type: Date,
    optional: true,
    label: 'Acquisition date',
    index: true,
  },
  // Элэгдэл бодож эхлэх огноо
  depreciationStartDate: {
    type: Date,
    optional: true,
    label: 'Depreciation start date',
  },
  // Анх орлогодсон accounting transaction-ийн холбоос
  transactionId: { type: String, optional: true, label: 'Transaction' },
  // Анх орлогодсон accounting transaction detail-ийн холбоос
  transactionDetailId: {
    type: String,
    optional: true,
    label: 'Transaction detail',
  },
  // Үндсэн хөрөнгийн master/card төлөв
  status: {
    type: String,
    enum: FIXED_ASSET_STATUSES.ALL,
    default: FIXED_ASSET_STATUSES.ACTIVE,
    label: 'Status',
    index: true,
  },
  // Энэ хөрөнгө дээр ашиглах элэгдэл бодох арга
  depreciationMethod: {
    type: String,
    optional: true,
    enum: FIXED_ASSET_DEPRECIATION_METHODS.ALL,
    label: 'Depreciation method',
  },
  // Жилд элэгдэх хувь
  annualDepreciationRate: {
    type: Number,
    optional: true,
    label: 'Annual depreciation rate',
  },
  // Элэгдүүлж дуусахад үлдээх өртөг
  salvageValue: { type: Number, optional: true, label: 'Salvage value' },
  // Татварын элэгдэл бодох арга
  taxDepreciationMethod: {
    type: String,
    optional: true,
    enum: FIXED_ASSET_DEPRECIATION_METHODS.ALL,
    label: 'Tax depreciation method',
  },
  // Татварын жилд элэгдэх хувь
  taxAnnualDepreciationRate: {
    type: Number,
    optional: true,
    label: 'Tax annual depreciation rate',
  },
  // Татварын элэгдэлд ашиглах үлдэх өртөг
  taxSalvageValue: {
    type: Number,
    optional: true,
    label: 'Tax salvage value',
  },
  // Products шиг custom property утгууд хадгална
  propertiesData: {
    type: Schema.Types.Mixed,
    optional: true,
    label: 'Properties data',
  },
  // Бүртгэл үүсгэсэн хэрэглэгч
  createdBy: { type: String, optional: true, label: 'Created user' },
  // Бүртгэл сүүлд зассан хэрэглэгч
  modifiedBy: { type: String, optional: true, label: 'Modified user' },
  // Бүртгэл үүссэн системийн огноо
  createdAt: { type: Date, default: Date.now, label: 'Created at' },
  // Бүртгэл сүүлд зассан системийн огноо
  updatedAt: { type: Date, optional: true, label: 'Modified at' },
});

fixedAssetSchema.index({ code: 1 }, { unique: true });
fixedAssetSchema.index({ transactionDetailId: 1 });
