import { Document } from 'mongoose';

export interface IFollowsForTr {
  type: string;
  id: string;
  subId?: string;
}
export interface ITrDetail {
  _id?: string;
  accountId: string;
  originId?: string;
  followType?: string;
  originSubId?: string;
  followInfos?: any;
  follows?: IFollowsForTr[];

  side: string;
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
};

export interface ITransaction {
  _id?: string;
  date: Date;
  fullDate?: Date;
  description: string;
  status?: string;
  ptrId?: string;
  parentId?: string;
  number?: string;
  journal: string;
  ptrStatus?: string;
  originId?: string;
  followType?: string;
  originSubId?: string;
  followInfos?: any;
  follows?: IFollowsForTr[];
  preTrId?: string;

  branchId?: string;
  departmentId?: string;
  customerType?: string;
  customerId?: string;
  assignedUserIds?: string[];

  details: ITrDetail[];
  shortDetail?: ITrDetail;
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
  permission?: string;
}

export interface IHiddenTransaction extends Document {
  _id: string,
  parentId: string,
  ptrId: string,
  ptrStatus: string;
  originId?: string,
  followType?: string,
  originSubId?: string,
  follows?: IFollowsForTr[]
  details: {
    _id: string;
    originId?: string;
    followType?: string;
    originSubId?: string;
    follows?: IFollowsForTr[];

    side: string;
  }[]
  sumDt: number;
  sumCt: number;
  permission?: string;
}
