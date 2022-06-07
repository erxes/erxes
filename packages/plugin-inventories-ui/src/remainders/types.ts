import { IProduct, IProductCategory, IUom } from '@erxes/ui-products/src/types';
import { QueryResponse } from '@erxes/ui/src/types';

export type ListQueryVariables = {
  page?: number;
  perPage?: number;
  search?: string;
};

export type IRemainderProduct = {
  remainder: number;
  uom: IUom;
} & IProduct;

export type RemainderProductsQueryResponse = {
  remainderProducts: { products: IRemainderProduct[]; totalCount: number };
} & QueryResponse;

export type ProductCategoriesQueryResponse = {
  productCategories: IProductCategory[];
} & QueryResponse;
