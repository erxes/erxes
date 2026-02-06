import { Schema } from 'mongoose';
import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';

export const exchangeRateSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    date: { type: Date, label: 'Date', index: true },
    mainCurrency: { type: String, label: 'Main Currency', },
    rateCurrency: { type: String, label: 'Rate Currency', },
    rate: { type: Number, label: 'Rate' },
    createdAt: { type: Date, default: new Date(), label: 'Created at' },
    modifiedAt: { type: Date, optional: true, label: 'Modified at' },
  })
);

exchangeRateSchema.index({ mainCurrency: 1, rateCurrency: 1, date: 1 });
exchangeRateSchema.index({ rateCurrency: 1, date: 1 });