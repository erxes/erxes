export interface IExchangeRate {
  _id?: string;
  date: Date;
  mainCurrency: string;
  rateCurrency: string;
  rate: number;
  createdAt: Date;
  modifiedAt: Date;
}

export type MainQueryResponse = {
  exchangeRatesMain: { list: IExchangeRate[]; totalCount: number };
};

export type CurrencyConfigResponse = {
  // "Main currency" config (general settings). Value can be a single
  // currency code or, in some setups, an array of codes.
  configsGetValue: { value?: string | string[] } | null;
};
