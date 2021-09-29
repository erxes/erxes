import {
  IProduct as IProductC,
  IProductCategory as IProductCategoryC,
  IProductDoc as IProductDocC
} from 'erxes-ui/lib/products/types';
import { QueryResponse } from 'modules/common/types';

export type IProductDoc = IProductDocC & {};

export type IProduct = IProductC & {};

export type IProductCategory = IProductCategoryC & {};

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

export type SelectFeatureMutationVariables = {
  _id: string;
  counter: string;
};

export type SelectFeatureMutationResponse = {
  productSelectFeature: (params: {
    variables: SelectFeatureMutationVariables;
  }) => Promise<any>;
};
