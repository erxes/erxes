import { QueryResponse } from '@erxes/ui/src/types';

export interface IRate {
  sellRate: number;
  number: string;
  name: string;
  midRate: number;
  currency: string;
  cashSellRate: number;
  cashBuyRate: number;
  buyRate: number;
}

export type RatesQueryResponse = {
  khanbankRates: IRate[];
} & QueryResponse;
