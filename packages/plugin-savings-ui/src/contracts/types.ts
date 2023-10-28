import {
  IActivityLog,
  IActivityLogForMonth
} from '@erxes/ui-log/src/activityLogs/types';
import { ITransaction } from '../transactions/types';

export interface IContract {
  _id: string;
  contractTypeId: string;
  number: string;
  status: string;
  branchId: string;
  description: string;
  savingAmount: number;
  startDate: Date;
  endDate: Date;
  duration: number;
  interestRate: number;
  closeInterestRate: number;

  customerId: string;
  customerType: string;

  currency: string;
  createdBy: string;
  createdAt: boolean;
  contractType?: any;

  closeDate?: Date;
  closeType?: string;
  closeDescription?: string;

  dealId?: string;
  storedInterest: number;
  lastStoredDate: Date;
  interestCalcType: string;
  storeInterestInterval: string;
  isAllowIncome: boolean;
  isAllowOutcome: boolean;
  interestGiveType: string;
  closeOrExtendConfig: string;
  depositAccount: string;
  customers?: any;
}

export interface IContractDoc extends IContract {
  _id: string;
}

export interface ISchedule {
  _id: string;
  contractId: string;
  version: string;
  createdAt: Date;
  status: string;
  payDate: Date;

  balance: number;
  payment?: number;
  total: number;

  transactionIds?: string[];
}

export interface ICloseInfo {
  balance?: number;
  storedInterest?: number;
  total?: number;
}

export interface IScheduleYear {
  year: number;
}

export interface IActivityLogYearMonthDoc {
  year: number;
  month: number;
}

export interface IContractActivityLog {
  date: IActivityLogYearMonthDoc;
  list: IActivityLog[];
}

// mutation types

export type EditMutationResponse = {
  contractsEdit: (params: { variables: IContractDoc }) => Promise<any>;
};

export type FillFromDealMutationVariables = {
  contractId: string;
};

export type FillFromDealMutationResponse = {
  getProductsData: (params: {
    variables: FillFromDealMutationVariables;
  }) => Promise<any>;
};

export type RemoveMutationVariables = {
  contractIds: string[];
};

export type RemoveMutationResponse = {
  contractsRemove: (params: {
    variables: RemoveMutationVariables;
  }) => Promise<any>;
};

export type CloseMutationVariables = {
  contractId: string;
  closeType: string;
  description: string;
};

export type CloseMutationResponse = {
  contractsClose: (params: {
    variables: CloseMutationVariables;
  }) => Promise<any>;
};

export type CloseInfoQueryResponse = {
  closeInfo: ICloseInfo;
  loading: boolean;
  refetch: (data: { date: Date }) => void;
};

export type AddMutationResponse = {
  contractsAdd: (params: { variables: IContract }) => Promise<any>;
};

export type RegenSchedulesMutationResponse = {
  regenSchedules: (params: {
    variables: { contractId: string };
  }) => Promise<any>;
  fixSchedules: (params: { variables: { contractId: string } }) => Promise<any>;
};

// query types

export type ListQueryVariables = {
  page?: number;
  perPage?: number;
  tag?: string;
  ids?: string[];
  searchValue?: string;
  sortField?: string;
  sortDirection?: number;
};

type ListConfig = {
  name: string;
  label: string;
  order: number;
};

export type MainQueryResponse = {
  savingsContractsMain: { list: IContract[]; totalCount: number };
  loading: boolean;
  refetch: () => void;
};

export type SchedulesQueryResponse = {
  savingsTransactions: ITransaction[];
  loading: boolean;
  refetch: (data: { year: number }) => void;
};

export type ContractsQueryResponse = {
  contracts: IContract[];
  loading: boolean;
  refetch: () => void;
};

export type ListConfigQueryResponse = {
  fieldsDefaultColumnsConfig: ListConfig[];
  loading: boolean;
};

export type DetailQueryResponse = {
  savingsContractDetail: IContract;
  loading: boolean;
  refetch: () => void;
};

export type ActivityLogQueryResponse = {
  activityLogs: IActivityLogForMonth[];
  loading: boolean;
};
