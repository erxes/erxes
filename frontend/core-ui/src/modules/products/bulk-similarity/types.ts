export interface ISimilarityInfo {
  name?: string;
  shortName?: string;
  code: string;
  categoryId?: string;
  type?: string;
  description?: string;
  unitPrice?: number;
  currency?: string;
  uom?: string;
  subUoms?: any[];
  vendorId?: string;
  scopeBrandIds?: string[];
  barcodeDescription?: string;
  attachment?: any;
  attachmentMore?: any[];
  pdfAttachment?: any;
}

export interface ISimilarityProduct {
  _id: string;
  code: string;
  name?: string;
  unitPrice?: number;
  status?: string;
  propertiesData?: Record<string, any>;
}

export interface IProductSimilarity {
  _id: string;
  status?: string;
  info: ISimilarityInfo;
  // selection per field: { [fieldId]: selectedValues[] }
  propertiesData: Record<string, string[]>;
  productIds?: string[];
  starProductId?: string;
  products?: ISimilarityProduct[];
}

export interface IBulkRow {
  productId?: string;
  code: string;
  unitPrice?: number;
  isExcluded?: boolean;
  // present and true only on the row the user starred
  isDefault?: boolean;
  // selection for this product: { [fieldId]: [value] }
  propertiesData: Record<string, string[]>;
}

export interface IBulkSaveInput {
  info: ISimilarityInfo;
  propertiesData: Record<string, string[]>;
  rows: IBulkRow[];
}
