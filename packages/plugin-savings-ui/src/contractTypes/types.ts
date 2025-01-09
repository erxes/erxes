import { IProduct } from "@erxes/ui-products/src/types";

export interface IContractConfig {
  transAccount: string;
  savingAccount: string;
  interestAccount: string;
  storedInterestAccount: string;
  minInterest: number
  maxInterest: number
  defaultInterest: number
  minDuration: number
  maxDuration: number
  minAmount: number
  maxAmount: number
  storeInterestTime: string;
}

export interface IContractTypeDoc {
  code: string;
  name: string;
  description: string;
  status: string;
  number: string;
  vacancy: number;
  currency: string;
  interestCalcType: string;
  storeInterestInterval: string;
  branchId: string;
  isAllowIncome: boolean;
  isAllowOutcome: boolean;
  isDeposit: boolean;
  interestRate: number;
  closeInterestRate: number;
  createdBy?: string;
  createdAt?: boolean;
  config?: IContractConfig;
  productType: string;
}

export interface IContractType extends IContractTypeDoc {
  _id: string;
  product: IProduct
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
  savingsContractTypesMain: { list: IContractType[]; totalCount: number };
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
  savingsContractTypeDetail: IContractTypeDetail;
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
