import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import { FXA_LOG_EVENT_TYPES } from '../../@types/constants';

export const fxaInstanceLogSchema = new Schema({
  _id: mongooseStringRandomId,
  // Түүх бүртгэж буй үндсэн хөрөнгийн нэгж
  fxaInstanceId: { type: String, label: 'Fixed asset instance', index: true },
  // Тайлан, шүүлтэд зориулж хадгалсан үндсэн хөрөнгийн холбоос
  fixedAssetId: { type: String, optional: true, label: 'Fixed asset' },
  // Орлого, хөдөлгөөн, элэгдэл, зарлага зэрэг үйл явдлын төрөл
  eventType: {
    type: String,
    enum: FXA_LOG_EVENT_TYPES.ALL,
    label: 'Event type',
    index: true,
  },
  // Үйл явдал болсон огноо
  eventDate: { type: Date, label: 'Event date', index: true },
  // Үйл явдлын нэмэлт тайлбар
  description: { type: String, optional: true, label: 'Description' },
  // Холбоотой accounting transaction байвал түүний id
  transactionId: { type: String, optional: true, label: 'Transaction' },
  // Холбоотой accounting transaction detail байвал түүний id
  transactionDetailId: {
    type: String,
    optional: true,
    label: 'Transaction detail',
  },
  // Өөрчлөлтийн өмнөх салбар
  fromBranchId: { type: String, optional: true, label: 'From branch' },
  // Өөрчлөлтийн дараах салбар
  toBranchId: { type: String, optional: true, label: 'To branch' },
  // Өөрчлөлтийн өмнөх хэлтэс
  fromDepartmentId: {
    type: String,
    optional: true,
    label: 'From department',
  },
  // Өөрчлөлтийн дараах хэлтэс
  toDepartmentId: { type: String, optional: true, label: 'To department' },
  // Өөрчлөлтийн өмнөх эд хариуцагч
  fromResponsibleUserId: {
    type: String,
    optional: true,
    label: 'From responsible user',
  },
  // Өөрчлөлтийн дараах эд хариуцагч
  toResponsibleUserId: {
    type: String,
    optional: true,
    label: 'To responsible user',
  },
  // Өөрчлөлтийн өмнөх төлөв
  fromStatus: { type: String, optional: true, label: 'From status' },
  // Өөрчлөлтийн дараах төлөв
  toStatus: { type: String, optional: true, label: 'To status' },
  // Түүх бүртгэсэн хэрэглэгч
  createdBy: { type: String, optional: true, label: 'Created user' },
  // Түүх бүртгэсэн системийн огноо
  createdAt: { type: Date, default: Date.now, label: 'Created at' },
});

fxaInstanceLogSchema.index({ fxaInstanceId: 1, eventDate: 1 });
fxaInstanceLogSchema.index({ transactionId: 1, transactionDetailId: 1 });
