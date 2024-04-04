import { ICompany } from '@erxes/ui-contacts/src/companies/types';
import { ICustomer } from '@erxes/ui-contacts/src/customers/types';

import { Counts, QueryResponse } from '@erxes/ui/src/types';

export interface IPayment {
  name: string;
  kind: string;
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

export interface IPaypalConfig {
  paypalMode: 'sandbox' | 'live';
  paypalClientId: string;
  paypalClientSecret: string;
}

export interface IMonpayConfig {
  username: string;
  accountId: string;
}

export interface IStorepayConfig {
  merchantUsername: string;
  merchantPassword: string;

  appUsername: string;
  appPassword: string;

  storeId: string;
}

export interface IPocketConfig {
  merchant: string;
  clientId: string;
  clientSecret: string;
}

export interface IPaymentDocument extends IPayment, Document {
  _id: string;
}

export type ByKindTotalCount = {
  qpay: number;
  socialpay: number;
};

export type InvoicesCount = {
  total: number;
  byKind: Counts;
  byStatus: Counts;
};

export interface IInvoice {
  _id: string;
  amount: number;
  contentType: string;
  contentTypeId: string;
  createdAt: Date;
  customerId: string;
  description: string;
  email: string;
  payment: IPayment;
  phone: string;
  resolvedAt: Date;
  status: string;
  customerType: string;
  customer?: any;
  paymentKind: string;
  errorDescription?: string;
  pluginData?: any;
  idOfProvider: string;
}

export interface IPaymentConfig {
  _id: string;
  paymentIds: string[];
  contentType: string;
  contentName: string;
  contentTypeId: string;

  payments: IPayment[];
}

export interface ISetConfigParams {
  contentType: string;
  contentTypeId: string;
  paymentIds: string[];
}

export type InvoicesQueryResponse = {
  invoices: IInvoice[];
} & QueryResponse;

export type InvoicesTotalCountQueryResponse = {
  invoicesTotalCount: InvoicesCount;
} & QueryResponse;

export type PaymentRemoveMutationResponse = {
  paymentsRemove: (params: { variables: { _id: string } }) => Promise<any>;
};

export type SetPaymentConfigMutationResponse = {
  setPaymentConfig: (params: {
    variables: { contentType; contentTypeId; paymentIds };
  }) => Promise<any>;
};

export type PaymentEditMutationResponse = {
  paymentEdit: (params: {
    variables: { id: string; doc: IPayment };
  }) => Promise<any>;
};

export type PaymentsQueryResponse = {
  payments: IPaymentDocument[];
  loading: boolean;
  refetch: () => void;
};

export type PaymentConfigQueryResponse = {
  getPaymentConfig: IPaymentConfig;
  loading: boolean;
  refetch: () => void;
};

export type PaymentsCountByTypeQueryResponse = {
  paymentsTotalCount: any;
  loading: boolean;
  refetch: () => void;
};

// SETTINGS

export type IConfigsMap = { [key: string]: any };

export type PaymentConfigsQueryResponse = {
  getPaymentConfigs: IPaymentConfig[];
  loading: boolean;
  refetch: () => void;
};

export type PaymentConfigsEditMutationResponse = {
  paymentConfigsEdit: (params: {
    variables: { id: string; paymentIds: string[] };
  }) => Promise<any>;
};

export type PaymentConfigsAddMutationResponse = {
  paymentConfigsAdd: (params: {
    variables: {
      contentType: string;
      contentTypeId: string;
      paymentIds: string[];
    };
  }) => Promise<any>;
};

export type PaymentConfigsRemoveMutationResponse = {
  paymentConfigsRemove: (params: { variables: { id: string } }) => Promise<any>;
};

export type PaymentConfigsCountQueryResponse = {
  paymentConfigsTotalCount: number;
  loading: boolean;
};
