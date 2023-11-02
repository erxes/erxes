import { Document, Schema } from 'mongoose';
import { customFieldSchema } from '@erxes/api-utils/src/types';
import { field } from './utils';

export interface IInsuranceItem {
  customerId: string;
  companyId: string;
  vendorUserId: string;
  productId: string;

  dealId?: string;

  customFieldsData?: any;

  status: string;
}

export interface IInsuranceItemDocument extends IInsuranceItem, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy: string;
}

export const itemSchema = new Schema({
  customerId: field({ type: String, sparse: true }),
  companyId: field({ type: String, sparse: true }),
  vendorUserId: field({ type: String, required: true }),
  productId: field({ type: String, required: true }),
  dealId: field({ type: String }),
  status: field({ type: String, required: true }),
  customFieldsData: field({ type: customFieldSchema }),
  lastModifiedBy: field({ type: String })
});
