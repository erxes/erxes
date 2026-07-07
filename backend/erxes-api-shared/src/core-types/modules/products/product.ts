import {
  IAttachment,
  ICustomField,
  IPdfAttachment,
  IPropertyField,
} from '../../common';
import { Document } from 'mongoose';

interface ISubUom {
  uom: string;
  ratio: number;
}

interface IInventory {
  [branchId: string]: {
    [departmentId: string]: {
      remainder: number;
      cost: number;
      soonIn: number;
      soonOut: number;
    };
  };
}

export type ProductDiscountConditionValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | {
      start?: string | number;
      end?: string | number;
    };

export interface IDiscount {
  planId: string;
  discount: number;
  discountPercent: number;
  prefixes: string[];
  conditions: Record<string, ProductDiscountConditionValue>;
}

export type ProductDurationType =
  | 'minute'
  | 'hour'
  | 'day'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year';

export interface IProduct {
  name: string;
  shortName?: string;
  categoryId?: string;
  categoryCode?: string;
  type?: string;
  scopeBrandIds?: string[];
  description?: string;
  barcodes?: string[];
  variants: { [code: string]: { image?: IAttachment; name?: string } };
  barcodeDescription?: string;
  unitPrice?: number;
  code: string;
  customFieldsData?: ICustomField[];
  propertiesData?: IPropertyField;
  tagIds?: string[];
  attachment?: IAttachment;
  attachmentMore?: IAttachment[];
  status?: string;
  vendorId?: string;
  vendorCode?: string;

  mergedIds?: string[];

  uom?: string;
  subUoms?: ISubUom[];
  sameMasks?: string[];
  sameDefault?: string[];
  currency?: string;
  duration?: number;
  durationType?: ProductDurationType;

  pdfAttachment?: IPdfAttachment;

  inventories?: IInventory;
  discounts?: IDiscount[];

  similarityId?: string;
}

export interface IProductDocument extends IProduct, Document {
  _id: string;
  createdAt: Date;
}
