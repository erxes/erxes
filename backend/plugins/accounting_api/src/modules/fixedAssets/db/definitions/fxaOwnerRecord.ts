import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import {
  FXA_OWNER_RECORD_ACTIONS,
  FXA_OWNER_RECORD_STATUSES,
} from '../../@types/constants';

export const fxaOwnerRecordSchema = new Schema({
  _id: mongooseStringRandomId,
  // Харьяалагдах үндсэн хөрөнгө
  fixedAssetId: { type: String, label: 'Fixed asset', index: true },
  // Эд хариуцагчид оноосон serial/дотоод код
  code: { type: String, label: 'Code', index: true },
  // Serial кодын дарааллын дугаар
  sequence: { type: Number, optional: true, label: 'Sequence', index: true },
  // Энэ бүртгэлийн мөрөөр хүлээн авсан эсвэл хүлээлгэн өгсөн тоо
  count: { type: Number, optional: true, label: 'Count' },
  // Хүлээж авсан эсвэл хүлээлгэж өгсөн хөдөлгөөний төрөл
  action: {
    type: String,
    optional: true,
    enum: FXA_OWNER_RECORD_ACTIONS.ALL,
    label: 'Action',
    index: true,
  },
  // Эд хариуцагчийн бүртгэлийн төлөв
  status: {
    type: String,
    enum: FXA_OWNER_RECORD_STATUSES.ALL,
    default: FXA_OWNER_RECORD_STATUSES.ACTIVE,
    label: 'Status',
    index: true,
  },
  // Хөрөнгийг хүлээж авсан эсвэл хүлээлгэж өгсөн эд хариуцагч
  ownerId: {
    type: String,
    optional: true,
    label: 'Owner',
    index: true,
  },
  // Эд хариуцагчийн бүртгэл үүсгэсэн accounting transaction-ийн холбоос
  transactionId: {
    type: String,
    optional: true,
    label: 'Transaction',
    index: true,
  },
  // Эд хариуцагчийн бүртгэл үүсгэсэн accounting transaction detail-ийн холбоос
  transactionDetailId: {
    type: String,
    optional: true,
    label: 'Transaction detail',
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

fxaOwnerRecordSchema.index({ fixedAssetId: 1, ownerId: 1, status: 1 });
fxaOwnerRecordSchema.index({ fixedAssetId: 1, ownerId: 1, action: 1 });
fxaOwnerRecordSchema.index({ fixedAssetId: 1, sequence: 1 });
fxaOwnerRecordSchema.index({ transactionDetailId: 1 });
