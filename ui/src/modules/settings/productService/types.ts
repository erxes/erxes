import { QueryResponse } from 'modules/common/types';
import { ICompany } from 'modules/companies/types';
import { ITag } from 'modules/tags/types';

export interface IProductDoc {
  _id?: string;
  type: string;
  name?: string;
  description?: string;
  sku?: string;
  createdAt?: Date;
  customFieldsData?: any;
}

export interface IProductCategoryDoc {
  _id?: string;
  name: string;
  description?: string;
  parentId?: string;
}

export interface IProduct {
  _id: string;
  name: string;
  type: string;
  categoryId: string;
  description: string;
  getTags?: ITag[];
  sku: string;
  code: string;
  unitPrice: number;
  customFieldsData?: any;
  createdAt: Date;
  vendorId?: string;

  attachment?: any;
  category: IProductCategory;
  vendor?: ICompany;
}

export interface IProductCategory {
  _id: string;
  name: string;
  order: string;
  code: string;
  description?: string;
  parentId?: string;
  createdAt: Date;
  productCount: number;
  isRoot: boolean;
}

// query types

export type ProductsQueryResponse = {
  products: IProduct[];
} & QueryResponse;

export type ProductsCountQueryResponse = {
  productsTotalCount: number;
} & QueryResponse;

export type ProductCategoriesQueryResponse = {
  productCategories: IProductCategory[];
} & QueryResponse;

export type ProductCategoriesCountQueryResponse = {
  productCategoriesTotalCount: number;
} & QueryResponse;

export type MutationVariables = {
  _id?: string;
  type: string;
  name?: string;
  description?: string;
  sku?: string;
  createdAt?: Date;
};

// mutation types

export type AddMutationResponse = {
  addMutation: (mutation: { variables: MutationVariables }) => Promise<any>;
};

export type EditMutationResponse = {
  editMutation: (mutation: { variables: MutationVariables }) => Promise<any>;
};

export type ProductRemoveMutationResponse = {
  productsRemove: (mutation: {
    variables: { productIds: string[] };
  }) => Promise<any>;
};

export type ProductCategoryRemoveMutationResponse = {
  productCategoryRemove: (mutation: {
    variables: { _id: string };
  }) => Promise<any>;
};

export type DetailQueryResponse = {
  productDetail: IProduct;
  loading: boolean;
};

export type CategoryDetailQueryResponse = {
  productCategoryDetail: IProductCategory;
  loading: boolean;
};

export type CountByTagsQueryResponse = {
  productCountByTags: { [key: string]: number };
  loading: boolean;
};

export type MergeMutationVariables = {
  productIds: string[];
  productFields: IProduct;
};

export type MergeMutationResponse = {
  productsMerge: (params: {
    variables: MergeMutationVariables;
  }) => Promise<any>;
};
