import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';
import { Document, Schema } from 'mongoose';

export const CURRENCY_RATE_MANUAL_SOURCE = 'manual';

export interface ICurrencyRate {
  date: Date;
  rateCurrency: string;
  rate: number;
}

export interface ICurrencyRateDocument extends ICurrencyRate, Document {
  _id: string;
  // the base currency at entry time, so a later base change keeps old rows readable
  mainCurrency: string;
  // 'manual' or a provider key; only manual rows are editable
  source: string;
  createdBy?: string;
  createdAt: Date;
  modifiedAt?: Date;
}

export const currencyRateSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    date: { type: Date, label: 'Date' },
    mainCurrency: { type: String, label: 'Main currency' },
    // 1 rateCurrency = rate mainCurrency
    rateCurrency: { type: String, label: 'Rate currency' },
    rate: { type: Number, label: 'Rate' },
    source: {
      type: String,
      default: CURRENCY_RATE_MANUAL_SOURCE,
      label: 'Source',
    },
    createdBy: { type: String, optional: true, label: 'Created by' },
    createdAt: { type: Date, default: Date.now, label: 'Created at' },
    modifiedAt: { type: Date, optional: true, label: 'Modified at' },
  }),
);

currencyRateSchema.index(
  { rateCurrency: 1, source: 1, date: 1 },
  { unique: true },
);
currencyRateSchema.index({ date: -1 });
