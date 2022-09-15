export interface IPaymentConfig {
  name: string;
  type: string;
  status: string;
  config: any;
}

export interface IPaymentConfigDocument extends IPaymentConfig, Document {
  _id: string;
}

export type PaymentConfigsQueryResponse = {
  paymentConfigs: IPaymentConfigDocument[];
  loading: boolean;
  refetch: () => void;
};
