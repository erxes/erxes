import { ICompany } from '@erxes/ui-contacts/src/companies/types';
import { IContract } from '../contracts/types';
import { ICustomer } from '@erxes/ui-contacts/src/customers/types';

export interface ITrDefaultDoc {
  date: Date;
  description: string;
  total: number;
}

export interface ITransactionDoc {
  number?: string;
  contractId?: string;
  customerId?: string;
  companyId?: string;
  transactionType: string;
  description?: string;
  payDate: Date;
  payment?: number;
  currency?: string;
  storedInterest?: number;
  total: number;
  balance?: number;
}

export interface ITransaction extends ITransactionDoc {
  _id: string;
}

// mutation types

export type EditMutationResponse = {
  savingsTransactionsEdit: (params: {
    variables: ITransaction;
  }) => Promise<any>;
};

export type RemoveMutationVariables = {
  transactionIds: string[];
};

export type RemoveMutationResponse = {
  savingsTransactionsRemove: (params: {
    variables: RemoveMutationVariables;
  }) => Promise<any>;
};

export type AddMutationResponse = {
  savingsTransactionsAdd: (params: {
    variables: ITransactionDoc;
  }) => Promise<any>;
};

// query types

export type ListQueryVariables = {
  page?: number;
  perPage?: number;
  ids?: string[];
  contractId?: string;
  customerId?: string;
  companyId?: string;
  startDate?: string;
  endDate?: string;
  payDate?: string;
  contractHasnt?: string;
  searchValue?: string;
  sortField?: string;
  sortDirection?: number;
};

export type MainQueryResponse = {
  savingsTransactionsMain: { list: ITransaction[]; totalCount: number };
  loading: boolean;
  refetch: () => void;
};

export type TransactionsQueryResponse = {
  transactions: ITransaction[];
  loading: boolean;
  refetch: () => void;
};

export type DetailQueryResponse = {
  transactionDetail: ITransaction;
  loading: boolean;
};

export type CountQueryResponse = {
  loading: boolean;
  refetch: () => void;
};
