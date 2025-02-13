import { Document, Schema } from 'mongoose';
import { field } from './utils';

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

// Mongoose schemas ===========

export const exchangeRateSchema = new Schema({
  _id: field({ pkey: true }),
  date: field({ type: Date, label: 'Date', index: true }),
  mainCurrency: field({ type: String, label: 'Main Currency', }),
  rateCurrency: field({ type: String, label: 'Rate Currency', }),
  rate: field({ type: Number, label: 'Rate' }),
  createdAt: field({ type: Date, default: new Date(), label: 'Created at' }),
  modifiedAt: field({ type: Date, optional: true, label: 'Modified at' }),
});

exchangeRateSchema.index({ mainCurrency: 1, rateCurrency: 1, date: 1 });