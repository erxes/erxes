export type Condition = {
  id: string;
  [key: string]: unknown;
};

export type PlaceConditionUI = {
  id: string;

  productCategoryIds?: string[];
  excludeCategoryIds?: string[];

  productTagIds?: string[];
  excludeTagIds?: string[];

  excludeProductIds?: string[];
  segmentIds?: string[];

  ltCount?: number;
  gtCount?: number;

  ltUnitPrice?: number;
  gtUnitPrice?: number;

  subUomType?: string;

  branchId?: string;
  departmentId?: string;
};

export type ProductPlacesReceiptProduct = {
  code?: string;
  name?: string;
};

export type ProductPlacesReceiptStock = {
  product?: ProductPlacesReceiptProduct;
  unitPrice: string | number;
  quantity: string | number;
  amount: string | number;
};

export type ProductPlacesReceiptBranch = {
  code?: string;
  title?: string;
};

export type ProductPlacesReceiptDepartment = {
  code?: string;
  title?: string;
};

export type ProductPlacesReceipt = {
  date: string;
  number?: string;
  branch?: ProductPlacesReceiptBranch | null;
  department?: ProductPlacesReceiptDepartment | null;
  customerCode?: string;
  customerName?: string;
  pDatas?: ProductPlacesReceiptStock[];
  amount: string | number;
  headerText?: string;
  footerText?: string;
};
export type ConfigValueItem = {
  key: string;
  value: unknown;
};

export type NormalizedConfig = Record<string, unknown>;
