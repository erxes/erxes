import { ICompany } from '@erxes/ui-contacts/src/companies/types';
import { ITag } from '@erxes/ui-tags/src/types';
import { IPdfAttachment, QueryResponse } from '@erxes/ui/src/types';

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

export interface IVariant {
  [code: string]: { name?: string; image?: any };
}
export interface IProduct {
  _id: string;
  name: string;
  shortName: string;
  type: string;
  categoryId: string;
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
