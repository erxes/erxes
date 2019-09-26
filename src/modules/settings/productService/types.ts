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
  sku: string;
  code: string;
  unitPrice: number;
  customFieldsData?: any;
  createdAt: Date;

  category: IProductCategory;
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
  loading: boolean;
  refetch: () => void;
};

export type ProductsCountQueryResponse = {
  productsTotalCount: number;
  loading: boolean;
  refetch: () => void;
};

export type ProductCategoriesQueryResponse = {
  productCategories: IProductCategory[];
  loading: boolean;
  refetch: () => void;
};

export type ProductCategoriesCountQueryResponse = {
  productCategoriesTotalCount: number;
  loading: boolean;
  refetch: () => void;
};

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
  productsRemove: (
    mutation: { variables: { productIds: string[] } }
  ) => Promise<any>;
};

export type ProductCategoryRemoveMutationResponse = {
  productCategoryRemove: (
    mutation: { variables: { _id: string } }
  ) => Promise<any>;
};

export type DetailQueryResponse = {
  productDetail: IProduct;
  loading: boolean;
};
