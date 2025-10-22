import { ICustomField, IPdfAttachment } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';

interface IAttachment {
  url: string;
  name: string;
  type: string;
  size: number;
}

export interface ISubUom {
  uom: string;
  ratio: number;
}
interface IProductCommonFields {
  name: string;
  code: string;
  description?: string;
  attachment?: IAttachment;
  tokens: string[];
}

export interface IPrice {
  [token: string]: number;
}

interface ITaxRule {
  [token: string]: {
    taxType?: string;
    taxCode?: string;
    citytaxCode?: string;
    citytaxPercent?: number;
  };
}

export interface IProduct extends IProductCommonFields {
  categoryId?: string;
  shortName?: string;
  type?: string;
  barcodes?: string[];
  barcodeDescription?: string;
  prices: IPrice;
  customFieldsData?: ICustomField[];
  tagIds?: string[];
  status?: string;
  vendorId?: string;
  vendorCode?: string;
  mergedIds?: string[];
  attachmentMore?: IAttachment[];
  uom?: string;
  subUoms?: ISubUom[];
  isCheckRems: { [token: string]: boolean };
  sameMasks?: string[];
  sameDefault?: string[];
  pdfAttachment?: IPdfAttachment;

  taxRules?: ITaxRule;
}

export interface IProductDocument extends IProduct, Document {
  _id: string;
  createdAt: Date;
  tokens: string[];
}

export interface IProductCategory extends IProductCommonFields {
  order: string;
  parentId?: string;
  status: string;
  maskType?: string;
  mask?: any;
  isSimilarity?: boolean;
  similarities: {
    id: string;
    groupId: string;
    fieldId: string;
    title: string;
  }[];
}

export interface IProductCategoryDocument extends IProductCategory, Document {
  _id: string;
  createdAt: Date;
  tokens: string[];
}
