import { IProduct } from '@erxes/ui-products/src/types';
import { QueryResponse } from '@erxes/ui/src/types';

export interface IProductsDataPerform {
  _id: string;
  productId: string;
  uom: string;
  quantity: number;
  totalCost: number;
  series?: string[];

  product?: any;
}

export interface IProductsData {
  _id: string;
  productId: string;
  quantity: number;
  uom: string;

  proportion?: number;
  product?: any;
}

export interface IProductsDataDocument extends IProductsData {}

// query types

export type ProductsQueryResponse = {
  products: IProduct[];
} & QueryResponse;

// mutation types

export type CountByTagsQueryResponse = {
  productCountByTags: { [key: string]: number };
  loading: boolean;
};

// SETTINGS

export type IConfigsMap = { [key: string]: any };

export type IProductsConfig = {
  _id: string;
  code: string;
  value: any;
};

// query types
export type ProductsConfigsQueryResponse = {
  productsConfigs: IProductsConfig[];
  loading: boolean;
  refetch: () => void;
};
