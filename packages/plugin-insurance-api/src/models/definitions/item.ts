import { Document, Schema } from 'mongoose';
import { customFieldSchema } from '@erxes/api-utils/src/types';
import { field } from './utils';

export interface IInsuranceItem {
  customerId?: string;
  companyId?: string;
  vendorUserId: string;
  productId: string;

  dealId?: string;

  customFieldsData?: any;

  status: string;

  price?: number;
}

export interface IInsuranceItemDocument extends IInsuranceItem, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy: string;
}

export const itemSchema = new Schema({
  _id: field({ pkey: true }),
  customerId: field({ type: String }),
  companyId: field({ type: String }),
  vendorUserId: field({ type: String, required: true }),
  productId: field({ type: String, required: true }),
  dealId: field({ type: String }),
  status: field({ type: String, required: true }),
  customFieldsData: field({ type: [customFieldSchema] }),
  lastModifiedBy: field({ type: String }),
  price: field({ type: Number })
});
