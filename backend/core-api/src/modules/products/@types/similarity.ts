import { IAttachment, IPdfAttachment } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';

export interface IProductSimilarityInfo {
  name?: string;
  shortName?: string;
  baseCode: string;
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
}

export interface IProductSimilarity {
  title?: string;
  status?: string;
  info: IProductSimilarityInfo;
  propertiesData: Record<string, any>;
  productIds?: string[];
  starProductId?: string;
}

export interface IProductSimilarityDocument
  extends IProductSimilarity,
    Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Input shape for bulkSaveSimilarity.
export interface IProductSimilarityBulkInput {
  _id?: string;
  title?: string;
  info: IProductSimilarityInfo;
  propertiesData: Record<string, any>;
  rows: IProductSimilarityRow[];
  starRowKey?: string;
}
