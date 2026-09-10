export type MNConfig<T = unknown> = {
  _id: string;
  code: string;
  subId?: string;
  value: T;
};

export interface MNConfigQueryResponse {
  mnConfig: MNConfig | null;
}

export interface MNConfigsCreateMutationResponse {
  mnConfigsCreate: MNConfig;
}

export interface MNConfigsUpdateMutationResponse {
  mnConfigsUpdate: MNConfig;
}

export interface MNConfigsRemoveMutationResponse {
  mnConfigsRemove: {
    _id: string;
  };
}

export type Condition = {
  id: string;
  [key: string]: unknown;
};

export type PerPrintConfig = {
  title: string;
  boardId: string;
  pipelineId: string;
  stageId: string;
  conditions: Condition[];
  [key: string]: unknown;
};

export type PerSplitConfig = {
  title?: string;
  boardId?: string;
  pipelineId?: string;
  stageId?: string;
  productCategoryIds?: string[];
  excludeCategoryIds?: string[];
  productTagIds?: string[];
  excludeTagIds?: string[];
  excludeProductIds?: string[];
  segments?: string[];
  [key: string]: unknown;
};

export type DefaultFilterConfig = {
  _id: string;
  title: string;
  segmentId: string;
  userIds: string[];
};

export type IConfigsMap = {
  dealsProductsDataPrint?: Record<string, PerPrintConfig>;
  dealsProductsDataPlaces?: Record<string, PerPrintConfig>;
  dealsProductsDataSplit?: Record<string, PerSplitConfig>;
  dealsProductsDefaultFilter?: DefaultFilterConfig[];
  // Allow other string keys for flexibility
  [key: string]: unknown;
};

export type IConfig = {
  _id: string;
  code: string;
  value: IConfigsMap;
};

// query types
export type ConfigsQueryResponse = {
  configsGetValue: IConfig;
  loading: boolean;
  refetch: () => void;
};

// Additional types for UI components
export type Board = {
  _id: string;
  name: string;
};

export type Pipeline = {
  _id: string;
  name: string;
};

export type Stage = {
  _id: string;
  name: string;
};

export type ProductCategory = {
  _id: string;
  name: string;
};

export type Tag = {
  _id: string;
  name: string;
  type?: string; // Changed to optional
};

export type Product = {
  _id: string;
  name: string;
};

export type Segment = {
  _id: string;
  name: string;
};

// Props types for components
export type PerPrintSettingsProps = {
  config: PerPrintConfig;
  currentConfigKey: string;
  save: (key: string, config: PerPrintConfig) => void;
  delete: (currentConfigKey: string) => void;
};

// Props types for PerSettings (Split component)
export type PerSettingsProps = {
  configsMap: IConfigsMap;
  config: PerSplitConfig; // This is PerSplitConfig, not IConfig
  currentConfigKey: string;
  save: (configsMap: IConfigsMap) => void;
  delete: (currentConfigKey: string) => void;
  productCategories: ProductCategory[];
  tags: Tag[];
  products: Product[];
  segments: Segment[];
};

export type PlaceConditionUI = {
  id: string;

  productCategoryIds?: string[];
  excludeCategoryIds?: string[];

  productTagIds?: string[];
  excludeTagIds?: string[];

  excludeProductIds?: string[];

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
