import { Document } from 'mongoose';

export interface IExchangeRate {
  date: Date;
  mainCurrency: string;
  rateCurrency: string;
  rate: number;
  createdAt: Date;
  modifiedAt: Date;
}

export interface IExchangeRateDocument extends IExchangeRate, Document {
  _id: string;
}
