import { Document } from 'mongoose';

export interface IAdjustFundRateDetail {
  _id?: string;

  accountId: string;
  mainBalance: number;
  currencyBalance: number;

  transactionId?: string;
}

export interface IAdjustFundRate {
  _id?: string;

  date: Date;
  mainCurrency: string;
  currency: string;
  description?: string;

  spotRate: number;

  gainAccountId: string;
  lossAccountId: string;
  transactionId?: string;

  details?: IAdjustFundRateDetail[];

  branchId?: string;
  departmentId?: string;

  createdBy: string;
  modifiedBy?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAdjustFundRateDocument extends IAdjustFundRate, Document {
  _id: string;
}
