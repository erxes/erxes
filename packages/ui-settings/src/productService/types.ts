import { QueryResponse } from '@erxes/ui/src/types';

import {
  IProduct as IProductC,
  IProductCategory as IProductCategoryC,
  IProductDoc as IProductDocC
} from '@erxes/ui-products/src/types';

export type IProductDoc = IProductDocC & {};

export type IProduct = IProductC & {};

export type IProductCategory = IProductCategoryC & {};

export type ProductCategoriesQueryResponse = {
  productCategories: IProductCategory[];
} & QueryResponse;
