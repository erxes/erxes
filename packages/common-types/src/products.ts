import { Document } from 'mongoose';

import { ICustomField } from './common';
import { ICompany } from './companies';
import { IAttachment } from './integrations';

interface IProductCommonFields {
  name: string;
  code: string;
  description?: string;
  attachment?: IAttachment;
}

export interface IProduct extends IProductCommonFields {
  categoryId?: string;
  type?: string;
  sku?: string;
  unitPrice?: number;
  customFieldsData?: ICustomField[];
  tagIds?: string[];
  status?: string;
  vendorId?: string;
  vendorCode?: string;
  mergedIds?: string[];
}

export interface IProductDocument extends IProduct, Document {
  _id: string;
  createdAt: Date;
  vendor?: ICompany;
}
