import { IAttachment, ICustomField, IPdfAttachment } from '../../common';
import { Document } from 'mongoose';

interface ISubUom {
  uom: string;
  ratio: number;
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
}

export interface IProductDocument extends IProduct, Document {
  _id: string;
  createdAt: Date;
}
