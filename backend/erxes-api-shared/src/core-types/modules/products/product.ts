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

interface IRemainder {
  [branchId: string]: {
    [departmentId: string]: {
      remainder: number;
      soonIn: number;
      soonOut: number;
    };
  };
}

interface IDiscount {
  [branchId: string]: {
    [departmentId: string]: {
      pricingId: { type: string };
      value: { type: number };
      percent: { type: number };
    };
  };
}

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

  pdfAttachment?: IPdfAttachment;

  remainders?: IRemainder;
  discounts?: IDiscount;
}

export interface IProductDocument extends IProduct, Document {
  _id: string;
  createdAt: Date;
}
