import { ICompany } from '@erxes/ui-contacts/src/companies/types';
import { ICustomer } from '@erxes/ui/src/customers/types';
import { QueryResponse } from '@erxes/ui/src/types';

export interface IPaymentConfig {
  name: string;
  type: string;
  status: string;
  config: any;
}

export interface IQpayConfig {
  qpayMerchantUser: string;
  qpayMerchantPassword: string;
  qpayInvoiceCode: string;
}

export interface ISocialPayConfig {
  inStoreSPTerminal: string;
  inStoreSPKey: string;
}

export interface IPaymentConfigDocument extends IPaymentConfig, Document {
  _id: string;
}

export interface IPaymentTypeCount {
  qpay: number;
  socialPay: number;
  total: number;
}

export interface IInvoice {
  _id: string;
  amount: number;
  contentType: string;
  contentTypeId: string;
  createdAt: Date;
  customerId: string;
  description: string;
  email: string;
  paymentConfig: IPaymentConfig;
  phone: string;
  resolvedAt: Date;
  status: string;
  company?: ICompany;
  customer?: ICustomer;
  pluginData?: any;
}

export type InvoicesQueryResponse = {
  invoices: (params: {
    variables: { page: number; perPage: number };
  }) => IInvoice[];
  loading: boolean;
  refetch: () => void;
};

export type InvoicesTotalCountQueryResponse = {
  invoicesTotalCount: number;
} & QueryResponse;

export type PaymentConfigsRemoveMutationResponse = {
  paymentConfigsRemove: (params: { variables: { id: string } }) => Promise<any>;
};

export type PaymentConfigsEditMutationResponse = {
  paymentConfigsEdit: (params: {
    variables: { id: string; doc: IPaymentConfig };
  }) => Promise<any>;
};

export type PaymentConfigsQueryResponse = {
  paymentConfigs: IPaymentConfigDocument[];
  loading: boolean;
  refetch: () => void;
};

export type PaymentConfigsCountByTypeQueryResponse = {
  paymentConfigsCountByType: IPaymentTypeCount;
  loading: boolean;
  refetch: () => void;
};

// SETTINGS

export type IConfigsMap = { [key: string]: any };

export type IConfig = {
  _id: string;
  code: string;
  value: any;
};

export type ConfigsQueryResponse = {
  configs: IConfig[];
  loading: boolean;
  refetch: () => void;
};

export const submenu = [{ title: 'Invoices', link: '/payment/invoices' }];
