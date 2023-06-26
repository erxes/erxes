import { Schema, Document } from 'mongoose';

import { field, schemaHooksWrapper } from './utils';

export interface ITumentechDeal {
  dealId: string;
  startPlaceId: string;
  endPlaceId: string;
  driverIds: string[];
  requiredCarCategoryIds: string[];
  productCategoryId: string;
  productSubCategoryId: string;
  createdAt: Date;
}

export interface ITumentechDealDocument extends ITumentechDeal, Document {
  _id: string;
}

export const tumentechDealSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    dealId: field({ type: String, label: 'Deal Id', required: true }),
    startPlaceId: field({ type: String, label: 'Deal start place Id' }),
    endPlaceId: field({ type: String, label: 'Deal end place Id' }),
    driverIds: field({ type: [String], label: 'Driver Ids' }),
    requiredCarCategoryIds: field({
      type: [String],
      label: 'Required car category Ids'
    }),
    productCategoryId: field({
      type: String,
      label: 'Product category Id'
    }),
    productSubCategoryId: field({
      type: String,
      label: 'Product sub category Id'
    }),
    createdAt: field({ type: Date, label: 'Created at' })
  }),
  'erxes_tumentech_deals'
);

// for tags query. increases search speed, avoids in-memory sorting
tumentechDealSchema.index({ customerId: 1, dealId: 1 });
