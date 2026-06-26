import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import {
  FIXED_ASSET_DEPRECIATION_METHODS,
  FXA_INSTANCE_STATUSES,
} from '../../@types/constants';

export const fxaInstanceSchema = new Schema({
  _id: mongooseStringRandomId,
  // Харьяалагдах үндсэн хөрөнгийн master/card
  fixedAssetId: { type: String, label: 'Fixed asset', index: true },
  // Тайлан, шүүлтэд зориулж хадгалсан бүлгийн холбоос
  categoryId: { type: String, optional: true, label: 'Category', index: true },
  // Тухайн нэгж хөрөнгийн дотоод код
  code: { type: String, label: 'Code', index: true },
  // Fixed asset master code-той хамт харуулах, засварлагдахгүй дарааллын дугаар
  sequence: { type: Number, optional: true, label: 'Sequence', index: true },
  // Тухайн нэгж хөрөнгийн одоогийн төлөв
  status: {
    type: String,
    enum: FXA_INSTANCE_STATUSES.ALL,
    default: FXA_INSTANCE_STATUSES.ACTIVE,
    label: 'Status',
    index: true,
  },
  // Тухайн нэгжийн анхны өртөг
  originalCost: { type: Number, label: 'Original cost' },
  // Энэ нэгж дээр ашиглах санхүүгийн элэгдэл бодох арга
  depreciationMethod: {
    type: String,
    optional: true,
    enum: FIXED_ASSET_DEPRECIATION_METHODS.ALL,
    label: 'Depreciation method',
  },
  // Энэ нэгжийн санхүүгийн ашиглах хугацаа
  usefulLife: { type: Number, optional: true, label: 'Useful life' },
  // Элэгдүүлж дуусахад үлдээх өртөг
  salvageValue: { type: Number, optional: true, label: 'Salvage value' },
  // Энэ нэгж дээр ашиглах татварын элэгдэл бодох арга
  taxDepreciationMethod: {
    type: String,
    optional: true,
    enum: FIXED_ASSET_DEPRECIATION_METHODS.ALL,
    label: 'Tax depreciation method',
  },
  // Энэ нэгжийн татварын ашиглах хугацаа
  taxUsefulLife: { type: Number, optional: true, label: 'Tax useful life' },
  // Энэ нэгжийн татварын үлдэх өртөг
  taxSalvageValue: {
    type: Number,
    optional: true,
    label: 'Tax salvage value',
  },
  // Тухайн нэгжийг орлогодсон огноо
  acquisitionDate: { type: Date, label: 'Acquisition date', index: true },
  // Элэгдэл бодож эхлэх огноо
  depreciationStartDate: {
    type: Date,
    optional: true,
    label: 'Depreciation start date',
  },
  // Хамгийн сүүлд элэгдэл бодсон огноо
  lastDepreciationDate: {
    type: Date,
    optional: true,
    label: 'Last depreciation date',
  },
  // Одоогийн салбар
  branchId: { type: String, optional: true, label: 'Branch', index: true },
  // Одоогийн хэлтэс
  departmentId: {
    type: String,
    optional: true,
    label: 'Department',
    index: true,
  },
  // Одоогийн эд хариуцагч
  responsibleUserId: {
    type: String,
    optional: true,
    label: 'Responsible user',
    index: true,
  },
  // Одоогийн ашиглалтын байршил
  locationId: { type: String, optional: true, label: 'Location' },
  // Энэ instance-ийг үүсгэсэн эсвэл сүүлд холбосон гүйлгээ
  transactionId: { type: String, optional: true, label: 'Transaction' },
  // Энэ instance-ийг үүсгэсэн эсвэл сүүлд холбосон гүйлгээний мөр
  transactionDetailId: {
    type: String,
    optional: true,
    label: 'Transaction detail',
  },
  // Анх орлогодсон гүйлгээ
  acquisitionTransactionId: {
    type: String,
    optional: true,
    label: 'Acquisition transaction',
  },
  // Анх орлогодсон гүйлгээний мөр
  acquisitionTrDetailId: {
    type: String,
    optional: true,
    label: 'Acquisition transaction detail',
  },
  // Зарлага, борлуулалт, данснаас хасалт хийсэн огноо
  disposalDate: { type: Date, optional: true, label: 'Disposal date' },
  // Зарлага, борлуулалт, данснаас хасалтын гүйлгээ
  disposalTransactionId: {
    type: String,
    optional: true,
    label: 'Disposal transaction',
  },
  // Зарлага, борлуулалт, данснаас хасалтын гүйлгээний мөр
  disposalTrDetailId: {
    type: String,
    optional: true,
    label: 'Disposal transaction detail',
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

fxaInstanceSchema.index({ fixedAssetId: 1, status: 1 });
fxaInstanceSchema.index(
  { fixedAssetId: 1, sequence: 1 },
  {
    unique: true,
    partialFilterExpression: { sequence: { $exists: true } },
  },
);
fxaInstanceSchema.index({ branchId: 1, departmentId: 1, status: 1 });
fxaInstanceSchema.index({ transactionId: 1, transactionDetailId: 1 });
