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
  recId: string;
  data?: any;
  registerNo?: string;
  productId?: string;
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
  _id?: string;
  number: string;
  contentType: string;
  contentId: string;
  userId?: string;
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
  type?: 'B2C_RECEIPT' | 'B2B_RECEIPT';
  data?: any;
  receipts?: IReceipt[];
  payments?: IPayment[];
  status?: string;
  message?: string;
  date?: string;
  registerNo?: string;
  qrData?: string;
  lottery?: string;
  state?: string;
  inactiveId?: string;
  sendInfo?: any;
  modifiedAt?: Date;
  createdAt?: Date;
  reportMonth?: string;
  posId?: number;
  invoiceId?: string;
  easy?: boolean;
  oldTaxType?: string;
  getInformation?: string;
}

export interface IEbarimtUpdate extends IEbarimt {
  _id: string;
}

// Remove the conflicting 'id' property from IEbarimt when extending Document
export interface IEbarimtDocument extends Omit<IEbarimt, 'id'>, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}