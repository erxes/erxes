export interface IExchangeRate {
  _id: string;
  date: Date;
  mainCurrency: string;
  rateCurrency: string;
  rate: number;
  createdAt: Date;
  modifiedAt: Date;
}

export type MainQueryResponse = {
  exchangeRatesMain: { list: IExchangeRate[]; totalCount: number };
  loading: boolean;
  refetch: () => void;
};

export type IConfig = {
  _id: string;
  code: string;
  value: any;
};

export type ConfigsQueryResponse = {
  configsGetValue: IConfig;
  loading: boolean;
  refetch: () => void;
};
