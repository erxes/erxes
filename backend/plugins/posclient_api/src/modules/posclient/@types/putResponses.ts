import { Document } from 'mongoose';

export interface IItem {
  _id?: string;
  id?: string;
  name: string;
  barCode?: string;
  barCodeType?: string;
  classificationCode?: string;
  taxProductCode?: string;
  measureUnit?: string;
  qty: number;
  unitPrice: number;
  totalBonus?: number;
  totalVAT?: number;
  totalCityTax?: number;
  totalAmount: number;
  data?: any;
  recId: string;
}

export interface IReceipt {
  _id?: string;
  id?: string;
  totalAmount: number;
  totalVAT?: number;
  totalCityTax?: number;
  taxType: string;
  merchantTin: string;
  bankAccountNo?: string;
  data?: any;
  items: IItem[];
}

export interface IPayment {
  _id?: string;
  code: string;
  exchangeCode?: string;
  status: string;
  paidAmount: number;
  data?: any;
}

export interface IEbarimt {
  number: string;

  // Холбогдох обьект
  contentType: string;
  contentId: string;
  posToken?: string;

  totalAmount?: number;
  totalVAT?: number;
  totalCityTax?: number;
  districtCode?: string;
  branchNo?: string;
  merchantTin?: string;
  posNo?: string;
  customerTin?: string;
  customerName?: string;
  consumerNo?: string;
  type?: string;
  inactiveId?: string;
  invoiceId?: string;
  reportMonth?: string;
  data?: any;
  receipts?: IReceipt[];
  payments?: IPayment[];

  easy?: boolean;

  // billType == 1 and lottery is null or '' then save
  getInformation?: string;
  // Ебаримт руу илгээсэн мэдээлэл
  sendInfo?: any;
  state?: string;
  userId?: string;
}

export interface IEbarimtFull extends IEbarimt {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;

  id: string;
  posId: number;
  status: string;
  message: string;
  qrData?: string;
  lottery?: string;
  date: string;
}

export interface IEbarimtDocument extends Document, IEbarimtFull {
  _id: string;
  id: string;
}
