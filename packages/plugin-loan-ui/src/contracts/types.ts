import {
  IActivityLog,
  IActivityLogForMonth
} from '@erxes/ui-log/src/activityLogs/types';

import { IContractTypeDoc } from '../contractTypes/types';
import { IInsuranceType } from '../insuranceTypes/types';
import { IProduct } from '@erxes/ui-products/src/types';
import { IUser } from '@erxes/ui/src/auth/types';

export interface ICollateralData {
  _id: string;
  collateralId?: string;
  collateral?: IProduct;
  certificate?: string;
  vinNumber?: string;
  currency?: string;

  cost: number;
  percent: number;
  marginAmount: number;
  leaseAmount: number;

  insuranceTypeId?: string;
  insuranceType?: IInsuranceType;
  insuranceAmount: number;
}

export interface IInsuranceData {
  _id: string;
  insuranceTypeId: string;
  insuranceType: IInsuranceType;
  currency: string;
  amount: number;
}

export interface IContract {
  _id: string;
  contractTypeId: string;
  number: string;
  status: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  marginAmount: number;
  leaseAmount: number;
  feeAmount: number;
  tenor: number;
  interestRate: number;
  repayment: string;
  startDate: Date;
  scheduleDay: number;
  collateralsData?: ICollateralData[];
  insurancesData?: IInsuranceData[];
  ownerId?: string;
  owner?: IUser;
  debt?: number;
  insuranceAmount?: number;
  salvageAmount?: number;
  salvagePercent?: number;
  salvageTenor?: number;
  relationExpertId: string;
  leasingExpertId: string;
  riskExpertId: string;

  contractType?: IContractTypeDoc;
  weekends: number[];
  useHoliday: boolean;
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
  undue?: number;
  interestEve?: number;
  interestNonce?: number;
  payment?: number;
  insurance?: number;
  debt?: number;
  total: number;

  didUndue?: number;
  didInterestEve?: number;
  didInterestNonce?: number;
  didPayment?: number;
  didInsurance?: number;
  didDebt?: number;
  didTotal: number;
  surplus?: number;

  transactionIds?: string[];
  isDefault: boolean;
}

export interface ICloseInfo {
  balance?: number;
  undue?: number;
  interest?: number;
  interestEve?: number;
  interestNonce?: number;
  payment?: number;
  insurance?: number;
  debt?: number;
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

export type ConfirmMutationVariables = {
  contractId: string;
};
export type ConfirmMutationResponse = {
  contractConfirm: (params: {
    variables: ConfirmMutationVariables;
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
  refetch: ({ date: Date }) => void;
};

export type AddMutationResponse = {
  contractsAdd: (params: { variables: IContract }) => Promise<any>;
};

export type RegenSchedulesMutationResponse = {
  regenSchedules: (params: {
    variables: { contractId: string };
  }) => Promise<any>;
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
  contractsMain: { list: IContract[]; totalCount: number };
  loading: boolean;
  refetch: () => void;
};

export type SchedulesQueryResponse = {
  schedules: ISchedule[];
  loading: boolean;
  refetch: ({ year: number }) => void;
};

export type ScheduleYearsQueryResponse = {
  scheduleYears: IScheduleYear[];
  loading: boolean;
  refetch: () => void;
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
  contractDetail: IContract;
  loading: boolean;
  refetch: () => void;
};

export type ActivityLogQueryResponse = {
  activityLogs: IActivityLogForMonth[];
  loading: boolean;
};
