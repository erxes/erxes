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
