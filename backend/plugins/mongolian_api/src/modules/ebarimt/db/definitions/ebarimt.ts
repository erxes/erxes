import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

export const itemsSchema = new Schema({
  _id: mongooseStringRandomId,
  id: { type: String, label: 'id' },
  name: { type: String, label: 'name' },
  barCode: { type: String, label: 'barCode' },
  barCodeType: { type: String, label: 'barCodeType' },
  classificationCode: { type: String, label: 'classificationCode' },
  taxProductCode: { type: String, label: 'taxProductCode' },
  measureUnit: { type: String, label: 'measureUnit' },
  qty: { type: Number, label: 'qty' },
  unitPrice: { type: Number, label: 'unitPrice' },
  totalBonus: { type: Number, label: 'totalBonus' },
  totalVAT: { type: Number, label: 'totalVAT' },
  totalCityTax: { type: Number, label: 'totalCityTax' },
  totalAmount: { type: Number, label: 'totalAmount' },
  data: { type: Object, label: 'data' },
  recId: { type: String, label: 'recId' },
  registerNo: String,
});

export const receiptSchema = new Schema({
  _id: mongooseStringRandomId,
  id: { type: String, label: 'id' },
  totalAmount: { type: Number, label: 'totalAmount' },
  totalVAT: { type: Number, label: 'totalVAT' },
  totalCityTax: { type: Number, label: 'totalCityTax' },
  taxType: { type: String, label: 'taxType' },
  merchantTin: { type: String, label: 'merchantTin' },
  bankAccountNo: { type: String, label: 'bankAccountNo' },
  data: { type: Object, label: 'data' },
  items: { type: [itemsSchema], label: 'items' },
});

export const paymentSchema = new Schema({
  _id: mongooseStringRandomId,
  code: { type: String, label: 'code' },
  exchangeCode: { type: String, label: 'exchangeCode' },
  status: { type: String, label: 'status' },
  paidAmount: { type: Number, label: 'paidAmount' },
  data: { type: Object, label: 'data' },
});

export const ebarimtSchema = new Schema({
  _id: mongooseStringRandomId,
  createdAt: { type: Date, label: 'Created at', index: true },
  modifiedAt: { type: Date, label: 'Modified at' },
  userId: { type: String, label: 'Created user', optional: true },
  number: { type: String, label: 'Inner bill number', index: true },

  // Холбогдох обьект
  contentType: { type: String, label: 'Content Type' },
  contentId: { type: String, label: 'Content', index: true },
  oldTaxType: { type: String, label: 'Old Tax Type', index: true },
  posToken: { type: String, optional: true },

  totalAmount: { type: Number, label: 'totalAmount' },
  totalVAT: { type: Number, label: 'totalVAT' },
  totalCityTax: { type: Number, label: 'totalCityTax' },
  districtCode: { type: String, label: 'districtCode' },
  branchNo: { type: String, label: 'branchNo' },
  merchantTin: { type: String, label: 'merchantTin' },
  posNo: { type: String, label: 'posNo' },
  customerTin: { type: String, optional: true, label: 'customerTin' },
  customerName: {
    type: String,
    optional: true,
    label: 'customerName',
  },
  consumerNo: { type: String, optional: true, label: 'consumerNo' },
  type: { type: String, label: 'type' },
  inactiveId: { type: String, label: 'inactiveId' },
  invoiceId: { type: String, label: 'invoiceId' },
  reportMonth: { type: String, label: 'reportMonth' },
  data: { type: Object, label: 'data' },
  receipts: { type: [receiptSchema], label: 'receipts' },
  payments: { type: [paymentSchema], label: 'payments' },

  id: { type: String, label: '' },
  posId: { type: Number, label: '' },
  status: { type: String, label: '' },
  message: { type: String, label: '' },
  qrData: { type: String, optional: true, label: '' },
  lottery: { type: String, optional: true, label: '' },
  date: { type: String, label: '' },

  easy: { type: Boolean, optional: true, label: '' },

  // billType == 1 and lottery is null or '' then save
  getInformation: { type: String, label: '' },
  // Ебаримт руу илгээсэн мэдээлэл
  sendInfo: { type: Object, label: '' },
  state: { type: String, optional: true, label: '' },
});

ebarimtSchema.index({ contentType: 1, contentId: 1, state: 1, type: 1 });
