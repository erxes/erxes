import { QueryResponse } from '@erxes/ui/src/types';

export interface IPaymentConfig {
  _id: string;
  name: string;
  kind: string;
}

// query types

export type PaymentsQueryResponse = {
  paymentConfigs: IPaymentConfig[];
} & QueryResponse;
