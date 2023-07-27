import { Document, Schema } from 'mongoose';

import { field } from './utils';

export interface IVendorProductsMapping {
  vendorProductId: string;
  companyId: string;
  price: number;
}

export interface IVendorProductsMappingDocument
  extends IVendorProductsMapping,
    Document {
  _id: string;
}

export interface IVendorCompanyConfig {
  companyId: string;
  vendorPortalId: string;

  categoryIds: string[];
  excludedCategoryIds: string[];
  excludedProductIds: string[];
}

export interface IVendorCompanyConfigDocument
  extends IVendorCompanyConfig,
    Document {
  _id: string;
}

export const vendorCompanyConfigSchema = new Schema({
  _id: field({ pkey: true }),
  companyId: field({ type: String, index: true }),
  vendorPortalId: field({ type: String, index: true }),

  categoryIds: field({ type: [String], default: [] }),
  excludedCategoryIds: field({ type: [String], default: [] }),
  excludedProductIds: field({ type: [String], default: [] })
});

export const vendorProductsMappingSchema = new Schema({
  _id: field({ pkey: true }),
  vendorProductId: field({ type: String, index: true }),
  companyId: field({ type: String, index: true }),
  price: field({ type: Number })
});

vendorCompanyConfigSchema.index(
  { companyId: 1, vendorPortalId: 1 },
  { unique: true }
);
