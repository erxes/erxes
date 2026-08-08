export interface IAdjustDebtRate {
  _id: string;
  date: Date;
  mainCurrency: string;
  currency: string;
  customerType?: string;
  customerId?: string;
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
  details?: IAdjustDebtRateDetail[];
}

export interface IAdjustDebtRateDetail {
  _id: string;
  accountId: string;
  mainBalance: number;
  currencyBalance: number;
  transactionId?: string;
  createdAt: Date;
  updatedAt?: Date;
}
