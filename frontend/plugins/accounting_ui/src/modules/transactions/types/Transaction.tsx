import { IAccount } from '@/settings/account/types/Account';
import { CustomerType, IBranch, IDepartment, IProduct } from 'ui-modules';
import { IVatRow } from '@/settings/vat/types/VatRow';
import { ICtaxRow } from '@/settings/ctax/types/CtaxRow';

export interface ITrDetail {
  _id?: string;
  accountId?: string;
  originId?: string;
  originType?: string;
  followInfos?: any;

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
  checked?: boolean;
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
  originType?: string;
  originSubId?: string;

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

  sumDt?: number;
  sumCt?: number;
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

export const trsQueryParamTypes: { [key: string]: string } = {
  ids: 'string[]',
  excludeIds: 'boolean',
  status: 'string',
  searchValue: 'string',
  number: 'string',
  accountIds: 'string[]',
  accountKind: 'string',
  accountExcludeIds: 'boolean',
  accountStatus: 'string',
  accountCategoryId: 'string',
  accountSearchValue: 'string',
  accountBrand: 'string',
  accountIsOutBalance: 'boolean',
  accountBranchId: 'string',
  accountDepartmentId: 'string',
  accountCurrency: 'string',
  accountJournal: 'string',
  brandId: 'string',
  isOutBalance: 'boolean',
  branchId: 'string',
  departmentId: 'string',
  currency: 'string',
  journal: 'string',
  statuses: 'string[]',
  createdUserId: 'string',
  modifiedUserId: 'string',
  date: 'startDate,endDate',
  updatedDate: 'startDate,endDate',
  createdDate: 'startDate,endDate',
  startDate: 'Date',
  endDate: 'Date',
  startUpdatedDate: 'Date',
  endUpdatedDate: 'Date',
  startCreatedDate: 'Date',
  endCreatedDate: 'Date',
}
