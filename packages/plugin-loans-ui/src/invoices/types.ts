import { ICompany } from '@erxes/ui-contacts/src/companies/types';
import { IContract } from '../contracts/types';
import { ICustomer } from '@erxes/ui-contacts/src/customers/types';
import { ITransactionDoc } from '../../api/models/definitions/transactions';

export interface IInvoiceDoc {
  contractId: string;
  createdAt: Date;
  createdBy?: string;
  customerId?: string;
  companyId?: string;
  number: string;
  status: string;
  payDate: Date;
  payment: number;
  interestEve: number;
  interestNonce: number;
  undue: number;
  insurance: number;
  debt: number;
  total: number;
}

export interface IInvoice extends IInvoiceDoc {
  _id: string;
  company?: ICompany;
  customer?: ICustomer;
  contract?: IContract;
  transaction?: ITransactionDoc;
}

export interface IInvoicePreInfo {
  contractId: string;
  number: string;
  payDate: Date;
  payment: number;
  interestEve: number;
  interestNonce: number;
  undue: number;
  insurance: number;
  debt: number;
  total: number;
}

// mutation types

export type EditMutationResponse = {
  invoicesEdit: (params: { variables: IInvoice }) => Promise<any>;
};

export type RemoveMutationVariables = {
  invoiceIds: string[];
};

export type RemoveMutationResponse = {
  invoicesRemove: (params: {
    variables: RemoveMutationVariables;
  }) => Promise<any>;
};

export type AddMutationResponse = {
  invoicesAdd: (params: { variables: IInvoiceDoc }) => Promise<any>;
};

// query types

export type ListQueryVariables = {
  page?: number;
  perPage?: number;
  ids?: string[];
  contractId?: string;
  customerId?: string;
  companyId?: string;
  payDate?: string;
  searchValue?: string;
  sortField?: string;
  sortDirection?: number;
};

export type MainQueryResponse = {
  invoicesMain: { list: IInvoice[]; totalCount: number };
  loading: boolean;
  refetch: () => void;
};

export type InvoicesQueryResponse = {
  invoices: IInvoice[];
  loading: boolean;
  refetch: () => void;
};

export type DetailQueryResponse = {
  invoiceDetail: IInvoice;
  loading: boolean;
};

export type CountQueryResponse = {
  loading: boolean;
  refetch: () => void;
};

export type GetInvoicePreInfoQueryResponse = {
  loading: boolean;
  info: IInvoicePreInfo;
};
