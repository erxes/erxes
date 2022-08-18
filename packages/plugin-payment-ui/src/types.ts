export interface IPaymentConfig {
  _id: string;
  name: string;
  type: string;
  status: string;
  config: any;
}

export type PaymentConfigsQueryResponse = {
  paymentConfigs: IPaymentConfig[];
  loading: boolean;
  refetch: () => void;
};

export type PaymentConfigsCountByTypeQueryResponse = {
  paymentConfigsCountByType: number;
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
