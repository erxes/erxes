import { IAccount } from "../settings/accounts/types"
import { QueryResponse } from '@erxes/ui/src/types';

export interface IMainTrInput {
  ptrId: string
  parentId: string
  number: string
  date: Date
  description: string
  journal: string

  branchId: string
  departmentId: string
  customerType: string
  customerId: string
  assignedUserIds?: [string]

  accountId: string
  side: string
  amount: number;
}

export interface ISingleTrInput extends IMainTrInput {
  currencyAmount?: number;
  customRate?: number;
  currencyDiffAccountId?: string;

  hasVat: boolean;
  vatRowId?: string;
  afterVat?: boolean;
  afterVatAccountId?: string;
  isHandleVat?: boolean;
  vatAmount?: number;

  hasCtax: boolean;
  ctaxRowId?: string;
  isHandleCtax?: boolean;
  ctaxAmount?: number;
}

export interface ICashTrInput extends ISingleTrInput { }
export interface IFundTrInput extends ISingleTrInput { }
export interface IDebtTrInput extends ISingleTrInput { }

export interface ITrDetail {
  _id?: string;
  accountId?: string;
  originId?: string;
  follows?: {
    type: string;
    id: string;
  }[];

  side?: string;
  amount?: number;
  currency?: string;
  currencyAmount?: number;
  customRate?: number;
  assignedUserId?: string;

  productId?: string;
  count?: number;
  unitPrice?: number;

  account?: IAccount;
};

export interface ITransaction {
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
  follows?: {
    type: string;
    id: string;
  }[];
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

  createdAt?: Date;
  modifiedAt?: Date;

  sumDt: number;
  sumCt: number;
  permission?: string;
}

export type TransactionDetailQueryResponse = {
  transactionDetail: ITransaction[];
} & QueryResponse;

export type TransactionsQueryResponse = {
  transactions: ITransaction[];
} & QueryResponse;

export type TransactionsCountQueryResponse = {
  transactionsCount: number;
} & QueryResponse;

export type AddMainTrMutationResponse = {
  addMainTrMutation: (params: { variables: IMainTrInput }) => Promise<ITransaction>;
};

export type EditMainTrMutationResponse = {
  editMainTrMutation: (params: {
    variables: { _id: string } & IMainTrInput;
  }) => Promise<ITransaction>;
};

export type RemoveMainTrMutationResponse = {
  removeMainTrMutation: (params: {
    variables: { _id: string };
  }) => Promise<String>;
};
