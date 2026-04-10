import { Document } from 'mongoose';

export interface ITrDetail {
  _id?: string;
  accountId: string;
  branchId?: string;
  departmentId?: string;
  followInfos?: any;
  originId?: string;
  originType?: string;
  originSubId?: string;

  amount: number;
  currency?: string;
  currencyAmount?: number;
  customRate?: number;

  assignedUserId?: string;

  excludeVat?: boolean;
  excludeCtax?: boolean;

  productId?: string;
  count?: number;
  unitPrice?: number;
}

export interface ITransaction {
  _id?: string;
  date: Date;
  fullDate?: Date;
  description?: string;
  status?: string;
  ptrId?: string;
  parentId?: string;
  number?: string;
  journal: string;
  ptrStatus?: string;

  followInfos?: any;
  originId?: string;
  originType?: string;
  originSubId?: string;
  preTrId?: string;

  branchId?: string;
  departmentId?: string;
  customerType?: string;
  customerId?: string;
  assignedUserIds?: string[];

  details: ITrDetail[];
  shortDetail?: ITrDetail;
  side?: string;

  createdBy?: string;
  modifiedBy?: string;

  hasVat?: boolean;
  vatRowId?: string;
  afterVat?: boolean;
  afterVatAccountId?: string;
  isHandleVat?: boolean;
  vatAmount?: number;

  hasCtax?: boolean;
  ctaxRowId?: string;
  isHandleCtax?: boolean;
  ctaxAmount?: number;

  extraData?: any;

  contentType?: string;
  contentId?: string;
}

export interface ITransactionDocument extends ITransaction, Document {
  _id: string;

  ptrId: string;
  parentId: string;
  number: string;
  status: string;
  ptrStatus: string;

  createdAt: Date;
  updatedAt?: Date;

  sumDt: number;
  sumCt: number;
  side: string;
  relAccounts: {
    dt: string[];
    ct: string[];
    customDt: string[];
    customCt: string[];
  };
  permission?: string;
}

export interface ITrRecord extends Omit<ITransaction, 'details'> {
  details: ITrDetail;
  trId: string;
}

export interface IHiddenTransaction extends Document {
  _id: string;
  parentId: string;
  ptrId: string;
  ptrStatus: string;
  originId?: string;
  originType?: string;
  originSubId?: string;
  details: {
    _id: string;
    originId?: string;
    originType?: string;
    originSubId?: string;
    side: string;
  }[];
  sumDt: number;
  sumCt: number;
  permission?: string;
}
