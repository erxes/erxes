import { Document } from 'mongoose';

export interface IAdjustFundRateDetail {
  _id?: string;

  accountId: string;
  mainBalance: number;
  currencyBalance: number;

  transactionId?: string;
  branchId?: string;
  departmentId?: string;

  createdAt?: Date;
  updatedAt?: Date;
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
  status?: 'draft' | 'process' | 'complete';
  beginDate?: Date;
  successDate?: Date;
  checkedAt?: Date;
  error?: string;
  warning?: string;

  details?: IAdjustFundRateDetail[];

  createdBy: string;
  modifiedBy?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAdjustFundRateDocument extends IAdjustFundRate, Document {
  _id: string;
}
