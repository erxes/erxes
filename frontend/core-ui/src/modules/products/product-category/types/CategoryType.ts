export interface AddCategoryResult {
  productCategoriesAdd: {
    _id: string;
    __typename: string;
  };
}

export interface CategoryData {
  productCategories: {
    list: AddCategoryResult['productCategoriesAdd'][];
    totalCount: number;
  };
}

export interface AddCategoryVariables {
  name: string;
  code: string;
  parentId?: string;
  scopeBrandIds?: string[];
  description?: string;
  attachment?: {
    url?: string;
    name?: string;
    type?: string;
  };
  status?: string;
  meta?: string;
  maskType?: string;
  mask?: object;
  isSimilarity?: boolean;
  similarities?: object;
}

export interface CategoryQueryVariables {
  perPage?: number;
  page?: number;
  searchValue?: string;
  parentId?: string;
  excludeIds?: string[];
  ids?: string[];
  status?: string;
  brandId?: string;
}
