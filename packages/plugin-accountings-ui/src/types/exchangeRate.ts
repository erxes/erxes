export interface IExchangeRate {
  date: Date;

  mainCurrency: string;
  rateCurrency: string;
  rate: number;
}

export interface IExchangeRateDocument
  extends IExchangeRate,
  Document {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
}