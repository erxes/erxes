import { IAccount } from '@/settings/account/types/Account';
import { CustomerType, IBranch, IDepartment, IProduct } from 'ui-modules';
import { IVatRow } from '@/settings/vat/types/VatRow';
import { ICtaxRow } from '@/settings/ctax/types/CtaxRow';

export interface ITrDetail {
  _id?: string;
  accountId?: string;
  originId?: string;
  followInfos?: any;
  follows?: {
    type: string;
    id: string;
  }[];

  side?: string;
  amount?: number;
  currencyAmount?: number;
  customRate?: number;
  assignedUserId?: string;

  excludeVat?: boolean;
  excludeCtax?: boolean;

  productId?: string;
  count?: number;
  unitPrice?: number;
  tempAmount?: number;

  account?: IAccount;
  product?: IProduct;
}

interface ICommontTr {
  _id?: string;
  date?: Date;
  description?: string;
  status?: string;
  ptrId?: string;
  parentId?: string;
  number?: string;
  journal: string;
  ptrStatus?: string;
  originId?: string;
  followType?: string;
  originSubId?: string;
  follows?: {
    type: string;
    id: string;
  }[];
  followExtras?: any;
  preTrId?: string;

  branchId?: string;
  departmentId?: string;
  customerType?: CustomerType;
  customerId?: string;
  assignedUserIds?: string[];

  createdBy?: string;
  modifiedBy?: string;

  createdAt?: Date;
  updatedAt?: Date;

  followInfos?: any;

  hasVat?: boolean;
  vatRowId?: string;
  afterVat?: boolean;
  isHandleVat?: boolean;
  vatAmount?: number;
  vatRow?: IVatRow;

  hasCtax?: boolean;
  ctaxRowId?: string;
  isHandleCtax?: boolean;
  ctaxAmount?: number;
  ctaxRow?: ICtaxRow;

  extraData?: any;

  sumDt: number;
  sumCt: number;
  permission?: string;

  branch?: IBranch;
  department?: IDepartment;
}

export interface ITransaction extends ICommontTr {
  details: ITrDetail[];
  shortDetail?: ITrDetail;
}

export interface ITrRecord extends ICommontTr {
  details: ITrDetail;
  shortDetail: ITrDetail;
  detailInd: number;
  trId: string;
}

export interface ITrInput {
  ptrId: string;
  parentId: string;
  number: string;
  date: Date;
  description: string;
  journal: string;

  branchId: string;
  departmentId: string;
  customerType: string;
  customerId: string;
  assignedUserIds?: [string];

  accountId: string;
  side: string;
  amount: number;
}
