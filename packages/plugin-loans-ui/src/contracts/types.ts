import {
  IActivityLog,
  IActivityLogForMonth,
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

export interface IStepRules {
  _id: string;
  scheduleDays?: number[];
  tenor: number; // loan duration month
  interestRate?: number;

  firstPayDate: Date;

  mainPayPerMonth?: number; // undsen tulultuus sardaa udiig tuluhuur
  totalMainAmount?: number; // niitdee ene heseg hugatsaand udiig tuluhuur
  salvageAmount?: number; // ene heseg udaagiin tulultiin daraa udii uldeheer

  skipInterestCalcMonth?: number;
  skipInterestCalcDay?: number;
  skipAmountCalcMonth?: number;
  skipAmountCalcDay?: number;
}

export interface IContract {
  _id: string;
  contractTypeId: string;
  number: string;
  useManualNumbering: boolean;
  foreignNumber?: string;
  relContractId?: string;
  dealId?: string;
  currency: string;
  status: string;
  statusChangedDate?: Date;

  classification: string;
  branchId: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  modifiedBy?: string;
  modifiedAt?: Date;

  marginAmount?: number;
  leaseAmount: number;
  feeAmount?: number;
  tenor: number;
  repayment: string;
  interestRate: number;
  lossPercent?: number;
  lossCalcType?: string;

  contractDate: Date;
  startDate: Date;
  firstPayDate: Date;
  endDate: Date;
  scheduleDays: number[];
  stepRules?: IStepRules[];

  insuranceAmount?: number;
  debt?: number;
  debtTenor?: number;
  debtLimit?: number;

  collateralsData?: ICollateralData[];
  insurancesData?: IInsuranceData[];

  customerType?: string;
  customerId?: string;
  relCustomers?: [{ customerId: string; customerType: string }];

  relationExpertId?: string;
  leasingExpertId?: string;
  riskExpertId?: string;

  closeDate?: Date;
  closeType?: string;
  closeDescription?: string;

  loanPurpose?: string;
  loanDestination?: string;
  leaseType: string;

  customFieldsData?: any[];
  savingContractId?: string;
  depositAccountId?: string;

  holidayType?: string;
  weekends?: number[];

  contractType?: IContractTypeDoc;
  unUsedBalance?: number;
  commitmentInterest: number;
  storedInterest: number;
}

export interface IContractGql {
  customers: [any];
  companies: [any];
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
  loss?: number;
  storedInterest?: number;
  interestEve?: number;
  interestNonce?: number;
  payment?: number;
  insurance?: number;
  debt?: number;
  total: number;

  didLoss?: number;
  didInterestEve?: number;
  didInterestNonce?: number;
  didPayment?: number;
  didInsurance?: number;
  didDebt?: number;
  didTotal: number;
  surplus?: number;

  transactionIds?: string[];
  isDefault: boolean;
  customers?: any;
}

export interface IInvoice {
  _id: string;
  contractId: string;
  version: string;
  createdAt: Date;
  status: string;
  payDate: Date;

  balance: number;
  loss?: number;
  interestEve?: number;
  interestNonce?: number;
  payment?: number;
  insurance?: number;
  debt?: number;
  total: number;
}

export interface ICloseInfo {
  balance?: number;
  loss?: number;
  interest?: number;
  interestEve?: number;
  interestNonce?: number;
  payment?: number;
  insurance?: number;
  storedInterest?: number;
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
  contractsMain: { list: IContract[]; totalCount: number };
  loading: boolean;
  refetch: () => void;
};

export type DealContractQueryResponse = {
  dealLoanContract: {
    contract: IContract;
    schedules: ISchedule[];
    firstSchedules: ISchedule[];
  };
  loading: boolean;
  refetch: () => void;
};

export type SchedulesQueryResponse = {
  schedules: ISchedule[];
  loading: boolean;
  refetch: (data: { year: number }) => void;
  subscribeToMore: any;
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
  subscribeToMore: any;
};

export type ActivityLogQueryResponse = {
  activityLogs: IActivityLogForMonth[];
  loading: boolean;
};
