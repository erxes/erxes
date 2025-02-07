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
  date: field({ type: Date, optional: true, label: 'Date' }),
  mainCurrency: field({
    type: String,
    optional: true,
    label: 'Main Currency',
  }),
  rateCurrency: field({
    type: String,
    optional: true,
    label: 'Rate Currency',
  }),
  rate: field({ type: Number, optional: true, label: 'Rate' }),
  createdAt: field({
    type: Date,
    default: new Date(),
    label: 'Created at',
    esType: 'date',
  }),
  modifiedAt: field({ type: Date, label: 'Modified at', esType: 'date' }),
});
