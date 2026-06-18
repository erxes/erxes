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
  dealCurrencies: { value?: string | string[] } | null;

  mainCurrencyConfig: { value?: string | string[] } | null;
};
