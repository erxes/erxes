import { IContract } from '../contracts/types';
import { ICustomer } from '@erxes/ui-contacts/src/customers/types';


export interface INonBalanceDetail {
  type: string;
  currency: string;
  ktAmount: number;
  dtAmount: number;
}

export interface INonBalanceTransactionDoc {
  contractId?: string;
  createdAt: Date;
  createdBy?: string;
  customerId?: string;
  description?: string;
  number?: string;
  transactionType?:string;
  detail: [INonBalanceDetail];
}

export interface INonBalanceTransaction extends INonBalanceTransactionDoc {
  _id: string;
  customer?: ICustomer;
  contract?: IContract;
}

// mutation types

export type RemoveMutationVariables = {
  nonBalanceTransactionIds: string[];
};

export type RemoveMutationResponse = {
  nonBalanceTransactionsRemove: (params: {
    variables: RemoveMutationVariables;
  }) => Promise<any>;
};

export type AddMutationResponse = {
  nonBalanceTransactionsAdd: (params: { variables: INonBalanceTransactionDoc }) => Promise<any>;
};

// query types

export type ListQueryVariables = {
  page?: number;
  perPage?: number;
  ids?: string[];
  contractId?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  payDate?: string;
  searchValue?: string;
  sortField?: string;
  sortDirection?: number;
};

export type MainQueryResponse = {
  nonBalanceTransactionsMain: { list: INonBalanceTransaction[]; totalCount: number };
  loading: boolean;
  refetch: () => void;
};

export type CountQueryResponse = {
  loading: boolean;
  refetch: () => void;
};
