import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import {
  FIXED_ASSET_CATEGORY_STATUSES,
  FIXED_ASSET_DEPRECIATION_METHODS,
} from '../../@types/constants';

export const fixedAssetCategorySchema = new Schema({
  _id: mongooseStringRandomId,
  // Үндсэн хөрөнгийн бүлгийн код
  code: { type: String, label: 'Code', index: true },
  // Үндсэн хөрөнгийн бүлгийн нэр
  name: { type: String, label: 'Name' },
  // Бүлгийн нэмэлт тайлбар
  description: { type: String, optional: true, label: 'Description' },
  // Дэд бүлэг бол харьяалагдах эцэг бүлэг
  parentId: { type: String, optional: true, label: 'Parent' },
  // Бүлгийн ашиглалтын төлөв
  status: {
    type: String,
    enum: FIXED_ASSET_CATEGORY_STATUSES.ALL,
    default: FIXED_ASSET_CATEGORY_STATUSES.ACTIVE,
    label: 'Status',
    index: true,
  },
  // Элэгдэл бодох арга
  depreciationMethod: {
    type: String,
    optional: true,
    enum: FIXED_ASSET_DEPRECIATION_METHODS.ALL,
    label: 'Depreciation method',
  },
  // Тухайн бүлэгт шинээр үүсэх хөрөнгийн анхны ашиглах хугацаа
  defaultUsefulLife: {
    type: Number,
    optional: true,
    label: 'Default useful life',
  },
  // Тухайн бүлэгт шинээр үүсэх хөрөнгийн анхны үлдэх өртөг
  defaultSalvageValue: {
    type: Number,
    optional: true,
    label: 'Default salvage value',
  },
  // Татварын элэгдэл бодох анхны арга
  taxDepreciationMethod: {
    type: String,
    optional: true,
    enum: FIXED_ASSET_DEPRECIATION_METHODS.ALL,
    label: 'Tax depreciation method',
  },
  // Татварын элэгдэлд ашиглах анхны хугацаа
  defaultTaxUsefulLife: {
    type: Number,
    optional: true,
    label: 'Default tax useful life',
  },
  // Татварын элэгдэлд ашиглах анхны үлдэх өртөг
  defaultTaxSalvageValue: {
    type: Number,
    optional: true,
    label: 'Default tax salvage value',
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

fixedAssetCategorySchema.index({ code: 1 }, { unique: true });
