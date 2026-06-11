export interface ISimilarityInfo {
  name?: string;
  shortName?: string;
  baseCode: string;
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
  title?: string;
  status?: string;
  info: ISimilarityInfo;
  // selection per field: { [fieldId]: selectedValues[] }
  propertiesData: Record<string, string[]>;
  productIds?: string[];
  starProductId?: string;
  products?: ISimilarityProduct[];
}

// A generated matrix row (UI state, derived from selection × products).
export interface IMatrixRow {
  key: string;
  productId?: string;
  // single combination: { [fieldId]: value }
  combination: Record<string, string>;
  code: string;
  unitPrice?: number;
  isExcluded?: boolean;
  isStar?: boolean;
}

export interface IBulkRow {
  productId?: string;
  code: string;
  unitPrice?: number;
  isExcluded?: boolean;
}

export interface IBulkSaveInput {
  title?: string;
  info: ISimilarityInfo;
  propertiesData: Record<string, string[]>;
  rows: IBulkRow[];
  starRowKey?: string;
}
