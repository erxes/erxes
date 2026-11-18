import { Document } from 'mongoose';

export type IInvSplitDetailInfo =
  | {
      hasSplit: false;
      productId?: string;
      ratio?: number;
    }
  | {
      hasSplit: true;
      productId: string;
      ratio: number;
    };

export interface ITrFollowInfos extends Record<string, unknown> {
  currencyDiffAccountId?: string;

  moveInAccountId?: string;
  moveInBranchId?: string;
  moveInDepartmentId?: string;

  saleTransactionId?: string;
  saleOutAccountId?: string;
  saleCostAccountId?: string;

  accumulatedDepreciationAccountId?: string;
  depreciationExpenseAccountId?: string;
  ownerId?: string;
  responsibleUserId?: string;
  fixedAssetAccountId?: string;
  lossAccountId?: string;

  branchCode?: string;
  departmentCode?: string;
  moveInAccountCode?: string;
  moveInBranchCode?: string;
  moveInDepartmentCode?: string;
  accumulatedDepreciationAccountCode?: string;
  saleOutAccountCode?: string;
  saleCostAccountCode?: string;

  invSplitDetails?: {
    detailId?: string;
    productId?: string;
    ratio?: number;
  }[];
}

export interface ITrDetailFollowInfos extends Record<string, unknown> {
  fixedAssetCategoryId?: string;
  fixedAssetCode?: string;
  fixedAssetName?: string;

  branchCode?: string;
  departmentCode?: string;
  /** Total accumulated depreciation for this detail, not per unit. */
  preDeprecation?: number;
  taxPreDeprecation?: number;
  hasTaxDepreciation?: boolean;
  incomeTaxRate?: number;
  revaluationLoss?: number;
  revaluationReserve?: number;
  salvageValue?: number;
  depreciationStartDate?: Date;
  currencyDiffAccountId?: string;
  moveInBranchId?: string;
  moveInDepartmentId?: string;
  invSplit?: IInvSplitDetailInfo;
  perCost?: number;
}

export interface ITrDetail {
  _id?: string;
  accountId: string;
  branchId?: string;
  departmentId?: string;
  followInfos?: ITrDetailFollowInfos;
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
  weight?: number;

  fixedAssetId?: string;
}

export interface ITransaction {
  _id?: string;
  date: Date;
  fullDate?: Date;
  description?: string;
  status?: string;
  mentionOwnerId?: string;
  mentionUserIds?: string[];
  ptrId?: string;
  parentId?: string;
  number?: string;
  ptrNumber?: string;
  journal: string;
  ptrStatus?: string;

  followInfos?: ITrFollowInfos;
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
  relAccounts?: {
    dt?: string[];
    ct?: string[];
    customDt?: string[];
    customCt?: string[];
  };

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

export interface ITransactionCounter {
  _id: string;
  seq: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITransactionCounterDocument
  extends ITransactionCounter,
    Document {
  _id: string;
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
  journal?: string;
  number?: string;
  ptrNumber?: string;
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
