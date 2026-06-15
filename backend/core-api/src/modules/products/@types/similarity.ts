import { IAttachment, IPdfAttachment } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';

export interface IProductSimilarityInfo {
  name?: string;
  shortName?: string;
  code: string;
  categoryId?: string;
  type?: string;
  description?: string;
  unitPrice?: number;
  currency?: string;
  uom?: string;
  subUoms?: any;
  vendorId?: string;
  scopeBrandIds?: string[];
  barcodeDescription?: string;
  attachment?: IAttachment;
  attachmentMore?: IAttachment[];
  pdfAttachment?: IPdfAttachment;
}

export interface IProductSimilarityRow {
  productId?: string;
  code: string;
  unitPrice?: number;
  isExcluded?: boolean;
  isDefault?: boolean;
  propertiesData: Record<string, string[]>;
}

export interface IProductSimilarity {
  status?: string;
  info: IProductSimilarityInfo;
  propertiesData: Record<string, any>;
  productIds?: string[];
  starProductId?: string;
}

export interface IProductSimilarityDocument
  extends IProductSimilarity, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductSimilarityBulkInput {
  _id?: string;
  info: IProductSimilarityInfo;
  propertiesData: Record<string, any>;
  rows: IProductSimilarityRow[];
}
