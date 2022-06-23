import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export interface IDealPlace {
  dealId: string;
  startPlaceId: string;
  endPlaceId: string;
}

export interface IDealPlaceDocument extends IDealPlace, Document {
  _id: string;
}

export const dealPlaceSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    dealId: field({ type: String, label: 'Deal Id', required: true }),
    startPlaceId: field({
      type: String,
      label: 'Start Place Id',
      required: true
    }),
    endPlaceId: field({ type: String, label: 'End Place Id', required: true })
  }),
  'deal_places'
);

dealPlaceSchema.index({ dealId: 1, startPlaceId: 1, endPlaceId: 1 });
