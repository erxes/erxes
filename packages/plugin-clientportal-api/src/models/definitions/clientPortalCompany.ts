import { field } from '@erxes/api-utils/src';
import { Document, Schema } from 'mongoose';

export interface IClientCompany {
  erxesCompanyId: string;
  productCategoryIds?: string[];
  clientPortalId: string;
}

export interface IClientCompanyDocument extends IClientCompany, Document {
  _id: string;
  createdAt?: Date;
}

export const companySchema = new Schema({
  _id: field({ pkey: true }),
  erxesCompanyId: field({ type: String }),
  productCategoryIds: field({ type: [String] }),
  clientPortalId: field({ type: String }),
  createdAt: field({ type: Date, default: Date.now })
});
