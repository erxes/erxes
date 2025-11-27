import { CurrencyCode, IAttachment } from 'erxes-ui';
import { PRODUCT_FORM_SCHEMA } from '../constant/addProductFormSchema';
import { z } from 'zod';

export interface IProduct {
  _id: string;
  name: string;
  unitPrice: number;
  code: string;
  categoryId: string;
  category?: IProductCategory;
  tagIds: string[];
  uom: string;
  type: 'product' | 'service' | 'unique' | 'subscription';
  currency: CurrencyCode;
}

export interface IProductCategory {
  _id: string;
  name: string;
  avatar: IAttachment;
  code: string;
  order: string;
  productCount: number;
  parentId: string;
}

export interface IUom {
  _id: string;
  name: string;
  code: string;
  productCount: number;
}

export interface IProductDetail extends IProduct {
  shortName: string;
  description: string;
  barcodeDescription: string;
  barcodes: string[];
  vendorId: string;
}

export type IProductFormValues = z.infer<typeof PRODUCT_FORM_SCHEMA>;
