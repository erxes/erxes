export interface ITrDetail {
  _id: string;
  accountId: string;
  transactionId: string;
  side: string;
  amount: number;
  currency?: string;
  currencyAmount?: number;
  customRate?: number;

  productId?: string;
  count?: number;
  unitPrice?: number;
};

export interface ITransaction {
  date: Date;
  description: string;
  status: string;
  ptrId?: string;
  parentId?: string;
  number?: string;
  journal: string;
  ptrStatus?: string;

  branchId?: string;
  departmentId?: string;
  customerType?: string;
  customerId?: string;


  details: ITrDetail[];
  sumDt: number;
  sumCt: number;
  createdBy?: string;
  modifiedBy?: string;
}

export interface ITransactionDocument extends ITransaction {
  _id: string;

  ptrId: string;
  parentId: string;
  number: string;
  ptrStatus: string;

  createdAt: Date;
  modifiedAt?: Date;
}