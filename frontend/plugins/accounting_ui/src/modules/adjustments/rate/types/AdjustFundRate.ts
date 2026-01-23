export interface IAdjustFundRate {
  _id: string;
  date: Date;
  mainCurrency: string;
  currency: string;
  description?: string;
  spotRate: number;
  gainAccountId: string;
  lossAccountId: string;
  transactionId?: string;
  branchId?: string;
  departmentId?: string;
  createdBy: string;
  modifiedBy?: string;
  createdAt: Date;
  updatedAt?: Date;
  details?: IAdjustFundRateDetail[];
}

export interface IAdjustFundRateDetail {
  _id: string;
  accountId: string;
  mainBalance: number;
  currencyBalance: number;
  transactionId?: string;
  createdAt: Date;
  updatedAt?: Date;
}
