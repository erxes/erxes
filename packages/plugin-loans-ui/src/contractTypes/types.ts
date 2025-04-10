import { IProduct } from "@erxes/ui-products/src/types";

export interface IContractConfig {
  receivable?: string;
  temp?: string;
  giving?: string;
  tempDebt?: string;

  mainUserEmail?: string;
  mainHasVat?: string;
  mainHasCitytax?: string;
  mainIsEbarimt?: string;

  districtName?: string;
  isAmountUseEBarimt?: boolean;
  isLossUseEBarimt?: boolean;

  interestReceivable?: string;
  interestGiving?: string;
  interestCalcedReceive?: string;
  interestIncome?: string;

  extraInterestUserEmail?: string;
  extraInterestHasVat?: string;
  extraInterestHasCitytax?: string;
  extraInterestIsEbarimt?: string;

  insuranceReceivable?: string;
  insuranceGiving?: string;

  lossStock?: string;
  lossUserEmail?: string;
  lossHasVat?: string;
  lossHasCitytax?: string;
  lossIsEbarimt?: string;

  otherReceivable?: string;
  feeIncome?: string;
  defaultCustomer?: string;
  userEmail?: string;
  repaymentTemp?: string;

  isAutoSendEBarimt?: boolean;

  normalExpirationDay?: number;
  expiredExpirationDay?: number;
  doubtExpirationDay?: number;
  negativeExpirationDay?: number;
  badExpirationDay?: number;

  boardId: string;
  pipelineId: string;
  stageId: string;

  minInterest?: number;
  maxInterest?: number;
  minTenor?: number;
  maxTenor?: number;
  minAmount?: number;
  maxAmount?: number;
  minCommitmentInterest?: number;
  maxCommitmentInterest?: number;

  requirements?: string[];
  customerDocuments?: string[];
  companyDocuments?: string[];
}

export interface IContractTypeDoc {
  code?: string;
  name?: string;
  description?: string;
  status?: string;
  number?: string;
  vacancy?: number;
  leaseType?: string;
  currency?: string;

  defaultInterest?: number;
  useSkipInterest?: boolean;
  skipInterestDay?: number;
  skipInterestMonth?: number;
  skipPaymentDay?: number;
  skipPaymentMonth?: number;

  lossPercent?: number;
  lossCalcType?: string;
  skipLossDay?: number;
  allowLateDay?: number;

  allowPartOfLease?: boolean;
  limitIsCurrent?: boolean;
  commitmentInterest?: number;

  useMargin?: boolean;
  useDebt?: boolean;
  useManualNumbering?: boolean;

  savingPlusLoanInterest?: number;
  savingUpperPercent?: number;

  config?: IContractConfig;
  productId?: string
  productType?: string;

  feePercent?: number;
  defaultFee?: number;
  useCollateral?: boolean;
  minPercentMargin?: number;

  overPaymentIsNext?: boolean;
  collectivelyRule?: string;
}

export interface IContractType extends IContractTypeDoc {
  _id: string;
  product?: IProduct
}

export interface IContractTypeDetail extends IContractType {
}

// mutation types

export type EditMutationResponse = {
  contractTypesEdit: (params: { variables: IContractType }) => Promise<any>;
};

export type RemoveMutationVariables = {
  contractTypeIds: string[];
};

export type RemoveMutationResponse = {
  contractTypesRemove: (params: {
    variables: RemoveMutationVariables;
  }) => Promise<any>;
};

export type AddMutationResponse = {
  contractTypesAdd: (params: { variables: IContractTypeDoc }) => Promise<any>;
};

// query types

export type ListQueryVariables = {
  page?: number;
  perPage?: number;
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
  contractTypesMain: { list: IContractType[]; totalCount: number };
  loading: boolean;
  refetch: () => void;
};

export type ContractTypesQueryResponse = {
  contractTypes: IContractType[];
  loading: boolean;
  refetch: () => void;
};

export type ListConfigQueryResponse = {
  fieldsDefaultColumnsConfig: ListConfig[];
  loading: boolean;
};

export type DetailQueryResponse = {
  contractTypeDetail: IContractTypeDetail;
  loading: boolean;
};

export type CountQueryResponse = {
  loading: boolean;
  refetch: () => void;
};

export type IConfigsMap = { [code: string]: any };

export type IConfig = {
  [code: string]: string;
};
