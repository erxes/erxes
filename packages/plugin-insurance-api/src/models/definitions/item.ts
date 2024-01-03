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

  feePercent?: number;
  totalFee?: number;
}

export interface IInsuranceItemDocument extends IInsuranceItem, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy: string;
}

const searchShema = {
  dealNumber: field({ type: String }),
  dealCreatedAt: field({ type: Date }),
  dealCloseDate: field({ type: Date }),
  dealStartDate: field({ type: Date }),

  customerRegister: field({ type: Date }),
  customerFirstName: field({ type: String }),
  customerLastName: field({ type: String }),

  itemPrice: field({ type: Number }),
  itemFeePercent: field({ type: Number }),
  itemTotalFee: field({ type: Number })
};

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
  price: field({ type: Number }),
  feePercent: field({ type: Number }),
  totalFee: field({ type: Number }),

  searchDictionary: field({ type: searchShema })
});
