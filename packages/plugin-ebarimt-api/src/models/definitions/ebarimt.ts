import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export interface IEbarimtConfig {
  ebarimtUrl: string;
  districtName: string;
  companyRD: string;
  vatPercent: string;
  cityTaxPercent: string;
  defaultGSCode: string;
}

export interface IItem {
  _id: string;
  id: string;
  name: string;
  barCode: string;
  barCodeType: string;
  classificationCode: string;
  taxProducCode: string;
  measureUnit: string;
  qty: number;
  unitPrice: number;
  totalBonus: number;
  totalVAT: number;
  totalCityTax: number;
  totalAmount: number;
  data: any;
}

export interface IReceipt {
  _id: string;
  id: string;
  totalAmount: number;
  totalVAT: number;
  totalCityTax: number;
  taxType: string;
  merchantTin: string;
  bankAccountNo: string;
  data: any;
  items: IItem[];
}

export interface IPayment {
  _id: string;
  code: string;
  exchangeCode: string;
  status: string;
  paidAmount: number;
  data: any;
}

export interface IEbarimt {
  createdAt: Date;
  modifiedAt: Date;
  number: string;

  // Холбогдох обьект
  contentType: string;
  contentId: string;
  posToken: string;

  totalAmount: number;
  totalVAT: number;
  totalCityTax: number;
  districtCode: string;
  merchantTin: string;
  posNo: string;
  customerTin: string;
  consumerNo: string;
  type: string;
  inactiveId: string;
  invoiceId: string;
  reportMonth: string;
  data: any;
  receipts: IReceipt[];
  payments: IPayment[];

  easy: boolean;

  // billType == 1 and lottery is null or '' then save
  getInformation: string;
  // Ебаримт руу илгээсэн мэдээлэл
  sendInfo: any
}

export interface IEbarimtDocument extends Document, IEbarimt {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;

  id: string;
  posId: number;
  status: string;
  message: string;
  qrData: string;
  lottery: string;
  date: string;
}

export const itemsSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    id: field({ type: String, label: 'id' }),
    name: field({ type: String, label: 'name' }),
    barCode: field({ type: String, label: 'barCode' }),
    barCodeType: field({ type: String, label: 'barCodeType' }),
    classificationCode: field({ type: String, label: 'classificationCode' }),
    taxProducCode: field({ type: String, label: 'taxProducCode' }),
    measureUnit: field({ type: String, label: 'measureUnit' }),
    qty: field({ type: Number, label: 'qty' }),
    unitPrice: field({ type: Number, label: 'unitPrice' }),
    totalBonus: field({ type: Number, label: 'totalBonus' }),
    totalVAT: field({ type: Number, label: 'totalVAT' }),
    totalCityTax: field({ type: Number, label: 'totalCityTax' }),
    totalAmount: field({ type: Number, label: 'totalAmount' }),
    data: field({ type: Object, label: 'data' }),
  }),

  'erxes_ebarimt'
)

export const receiptSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    id: field({ type: String, label: 'id' }),
    totalAmount: field({ type: Number, label: 'totalAmount' }),
    totalVAT: field({ type: Number, label: 'totalVAT' }),
    totalCityTax: field({ type: Number, label: 'totalCityTax' }),
    taxType: field({ type: String, label: 'taxType' }),
    merchantTin: field({ type: String, label: 'merchantTin' }),
    bankAccountNo: field({ type: String, label: 'bankAccountNo' }),
    data: field({ type: Object, label: 'data' }),
    items: field({ type: [itemsSchema], label: 'items' }),
  }),

  'erxes_ebarimt'
)

export const paymentSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    code: field({ type: String, label: 'code' }),
    exchangeCode: field({ type: String, label: 'exchangeCode' }),
    status: field({ type: String, label: 'status' }),
    paidAmount: field({ type: Number, label: 'paidAmount' }),
    data: field({ type: Object, label: 'data' })
  }),
  'erxes_ebarimt'
)

export const ebarimtSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    createdAt: field({ type: Date, label: 'Created at', index: true }),
    modifiedAt: field({ type: Date, label: 'Modified at' }),
    number: field({ type: String, label: 'Inner bill number', index: true }),

    // Холбогдох обьект
    contentType: field({ type: String, label: 'Content Type' }),
    contentId: field({ type: String, label: 'Content', index: true }),
    posToken: field({ type: String, optional: true }),

    totalAmount: field({ type: Number, label: 'totalAmount' }),
    totalVAT: field({ type: Number, label: 'totalVAT' }),
    totalCityTax: field({ type: Number, label: 'totalCityTax' }),
    districtCode: field({ type: String, label: 'districtCode' }),
    merchantTin: field({ type: String, label: 'merchantTin' }),
    posNo: field({ type: String, label: 'posNo' }),
    customerTin: field({ type: String, label: 'customerTin' }),
    consumerNo: field({ type: String, label: 'consumerNo' }),
    type: field({ type: String, label: 'type' }),
    inactiveId: field({ type: String, label: 'inactiveId' }),
    invoiceId: field({ type: String, label: 'invoiceId' }),
    reportMonth: field({ type: String, label: 'reportMonth' }),
    data: field({ type: Object, label: 'data' }),
    receipts: field({ type: [receiptSchema], label: 'receipts' }),
    payments: field({ type: [paymentSchema], label: 'payments' }),

    id: field({ type: String, label: '' }),
    posId: field({ type: Number, label: '' }),
    status: field({ type: String, label: '' }),
    message: field({ type: String, label: '' }),
    qrData: field({ type: String, label: '' }),
    lottery: field({ type: String, label: '' }),
    date: field({ type: String, label: '' }),

    easy: field({ type: Boolean, label: '' }),

    // billType == 1 and lottery is null or '' then save
    getInformation: field({ type: String, label: '' }),
    // Ебаримт руу илгээсэн мэдээлэл
    sendInfo: field({ type: Object, label: '' }),
  }),

  'erxes_ebarimt'
);

ebarimtSchema.index({ contentType: 1, contentId: 1, status: 1 });
ebarimtSchema.index({ contentType: 1, contentId: 1, taxType: 1, status: 1 });
