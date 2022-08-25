export interface IPaymentConfig {
  _id: string;
  name: string;
  type: string;
  status: string;
  config: any;
}

export interface IPaymentTypeCount {
  qpay: number;
  socialPay: number;
  total: number;
}

export type PaymentConfigsRemoveMutationResponse = {
  paymentConfigsRemove: (params: { variables: { id: string } }) => Promise<any>;
};

export type PaymentConfigsQueryResponse = {
  paymentConfigs: IPaymentConfig[];
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
