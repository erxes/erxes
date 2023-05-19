import { ICompany } from '@erxes/ui-contacts/src/companies/types';
import { IContract } from '../contracts/types';
import { ICustomer } from '@erxes/ui-contacts/src/customers/types';
import { IInvoiceDoc } from '../invoices/types';

export interface ITrDefaultDoc {
  date: Date;
  description: string;
  total: number;
}

export interface ITransactionDoc {
  contractId: string;
  createdAt: Date;
  createdBy?: string;
  customerId?: string;
  companyId?: string;
  invoiceNumber?: string;
  payDate: Date;
  description?: string;
  payment: number;
  interestEve: number;
  interestNonce: number;
  undue: number;
  insurance: number;
  debt: number;
  total: number;
  futureDebt?: number;
  debtTenor?: number;
}

export interface ITransaction extends ITransactionDoc {
  _id: string;
  company?: ICompany;
  customer?: ICustomer;
  contract?: IContract;
  invoice?: IInvoiceDoc;
  calcedInfo?: any;
}

// mutation types

export type EditMutationResponse = {
  transactionsEdit: (params: { variables: ITransaction }) => Promise<any>;
};

export type RemoveMutationVariables = {
  transactionIds: string[];
};

export type RemoveMutationResponse = {
  transactionsRemove: (params: {
    variables: RemoveMutationVariables;
  }) => Promise<any>;
};

export type AddMutationResponse = {
  transactionsAdd: (params: { variables: ITransactionDoc }) => Promise<any>;
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
  transactionsMain: { list: ITransaction[]; totalCount: number };
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
