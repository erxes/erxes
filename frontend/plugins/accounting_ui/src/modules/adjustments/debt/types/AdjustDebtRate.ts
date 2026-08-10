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
  status?: 'draft' | 'process' | 'complete';
  beginDate?: Date;
  successDate?: Date;
  checkedAt?: Date;
  error?: string;
  warning?: string;
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
  accountCode?: string;
  accountName?: string;
  accountKind?: string;
  accountCurrency?: string;
  customerType?: string;
  customerId?: string;
  branchId?: string;
  departmentId?: string;
  mainBalance: number;
  currencyBalance: number;
  diff?: number;
  transactionId?: string;
  createdAt: Date;
  updatedAt?: Date;
}
