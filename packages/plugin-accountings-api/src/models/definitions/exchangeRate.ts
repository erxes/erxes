import { Document, Schema } from 'mongoose';
import { field } from './utils';

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

// Mongoose schemas ===========

export const exchangeRateSchema = new Schema({
  _id: field({ pkey: true }),
  date: field({ type: Date }),
  mainCurrency: field({ type: String }),
  rateCurrency: field({ type: String }),
  rate: field({ type: Number }),
  createdAt: field({ type: Date }),
  modifiedAt: field({ type: Date })
});
