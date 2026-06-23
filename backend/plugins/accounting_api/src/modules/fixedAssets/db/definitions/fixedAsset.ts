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
  // Ашиглах хугацаа
  usefulLife: { type: Number, optional: true, label: 'Useful life' },
  // Элэгдүүлж дуусахад үлдээх өртөг
  salvageValue: { type: Number, optional: true, label: 'Salvage value' },
  // Татварын элэгдэл бодох арга
  taxDepreciationMethod: {
    type: String,
    optional: true,
    enum: FIXED_ASSET_DEPRECIATION_METHODS.ALL,
    label: 'Tax depreciation method',
  },
  // Татварын элэгдэлд ашиглах хугацаа
  taxUsefulLife: { type: Number, optional: true, label: 'Tax useful life' },
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
