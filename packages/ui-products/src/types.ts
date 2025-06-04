import { ICompany } from "@erxes/ui-contacts/src/companies/types";
import { ITag } from "@erxes/ui-tags/src/types";
import { IPdfAttachment, QueryResponse } from "@erxes/ui/src/types";

export interface IProductDoc {
  _id?: string;
  type: string;
  name?: string;
  description?: string;
  createdAt?: Date;
  customFieldsData?: any;
}

export interface IUom {
  _id: string;
  name: string;
  code: string;
  createdAt: Date;
  isForSubscription?: boolean;
  subscriptionConfig?: any;
  timely?: string;
}

export interface IBundleCondition {
  _id: string;
  name: string;
  code: string;
  description?: string;
  isDefault?: boolean;
}

export interface IBundleRuleItem {
  code: string;
  quantity: number;
  productIds: string[];
  products: IProduct[];
  priceValue: number;
  percent: number;
  priceType: "thisProductPricePercent" | "price" | "mainPricePercent";
  priceAdjustType: string;
  priceAdjustFactor: number;
  allowSkip: boolean;
}
export interface IBundleRule {
  _id: string;
  name: string;
  code: string;
  description?: string;
  rules: IBundleRuleItem[];
  selectedBy?: string;
}
export interface IVariant {
  [code: string]: { name?: string; image?: any };
}
export interface IProduct {
  _id: string;
  name: string;
  shortName: string;
  type: string;
  categoryId: string;
  bundleId?: string;
  bundle: IBundleRule;
  description: string;
  tagIds: string[];
  getTags?: ITag[];
  barcodes: string[];
  variants: IVariant;
  barcodeDescription: string;
  code: string;
  currency: string;
  unitPrice: number;
  customFieldsData?: any;
  createdAt: Date;
  vendorId?: string;
  scopeBrandIds: string[];

  attachment?: any;
  attachmentMore?: any[];
  category: IProductCategory;
  vendor?: ICompany;

  uom?: string;
  subUoms?: any[];

  pdfAttachment?: IPdfAttachment;
}

export interface IProductCategory {
  _id: string;
  name: string;
  order: string;
  code: string;
  description?: string;
  attachment?: any;
  status: string;
  parentId?: string;
  createdAt: Date;
  productCount: number;
  isRoot: boolean;
  meta: string;
  maskType: string;
  mask: any;
  isSimilarity: boolean;
  similarities: any[];
}

export type MutationVariables = {
  _id?: string;
  type: string;
  name?: string;
  description?: string;
  barcodes?: string[];
  createdAt?: Date;
};

export type DetailQueryResponse = {
  productDetail: IProduct;
  loading: boolean;
};

// mutation types

export type ProductRemoveMutationResponse = {
  productsRemove: (mutation: {
    variables: { productIds: string[] };
  }) => Promise<any>;
};

export type ProductsQueryResponse = {
  loading: boolean;
  refetch: (variables?: {
    searchValue?: string;
    perPage?: number;
    categoryId?: string;
    vendorId?: string;
  }) => void;
  products: IProduct[];
};

export type ProductAddMutationResponse = {
  productAdd: (params: { variables: IProductDoc }) => Promise<void>;
};

export type ProductCategoriesQueryResponse = {
  productCategories: IProductCategory[];
} & QueryResponse;

export type ProductsQueryResponses = {
  products: IProduct[];
} & QueryResponse;

export type EditMutationResponse = {
  editMutation: (mutation: { variables: MutationVariables }) => Promise<any>;
};

// UOM
export type UomsQueryResponse = {
  uoms: IUom[];
} & QueryResponse;

// SETTINGS

// Bundle Conditions
export type BundleConditionQueryResponse = {
  bundleConditions: IBundleCondition[];
} & QueryResponse;

export type BundleRulesQueryResponse = {
  bundleRules: IBundleRule[];
} & QueryResponse;
export type BundleRuleQueryResponse = {
  bundleRuleDetail: IBundleRule;
} & QueryResponse;

export type IConfigsMap = { [key: string]: any };

export type IProductsConfig = {
  _id: string;
  code: string;
  value: any;
};

export type ProductsConfigsQueryResponse = {
  productsConfigs: IProductsConfig[];
  loading: boolean;
  refetch: () => void;
};

export type IConfig = {
  _id: string;
  code: string;
  value: any;
};

export type ConfigsQueryResponse = {
  configsGetValue: IConfig;
  loading: boolean;
  refetch: () => void;
};

// Product rules
export interface IProductRule {
  _id: string;
  categoryIds?: string[];
  excludeCategoryIds?: string[];
  productIds?: string[];
  excludeProductIds?: string[];
  tagIds?: string[];
  excludeTagIds?: string[];
  unitPrice: number;
  bundleId?: string;
  name: string;

  // resolved fields
  categories?: IProductCategory[];
  excludeCategories?: IProductCategory[];
  products?: IProduct[];
  excludeProducts?: IProduct[];
  tags?: ITag[];
  excludeTags?: ITag[];
};

export type ProductRulesQueryResponse = {
  productRules: IProductRule[];
} & QueryResponse;
