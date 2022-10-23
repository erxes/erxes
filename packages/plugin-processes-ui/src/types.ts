import { IProduct, IUom } from '@erxes/ui-products/src/types';
import { QueryResponse } from '@erxes/ui/src/types';

export interface IProductsData {
  _id: string;
  productId: string;
  product?: any;
  quantity: number;
  uomId: string;
  proportion?: number;
  uom?: IUom;
}

export interface IProductsDataDocument extends IProductsData {}

// query types

export type ProductsQueryResponse = {
  products: IProduct[];
} & QueryResponse;

// UOM

export type UomsQueryResponse = {
  uoms: IUom[];
} & QueryResponse;

export type UomsCountQueryResponse = {
  uomsTotalCount: number;
} & QueryResponse;

export type MutationVariables = {
  _id?: string;
  type: string;
  name?: string;
  description?: string;
  sku?: string;
  createdAt?: Date;
};

export type MutationUomVariables = {
  _id?: string;
  name: string;
  code: string;
};

// mutation types

export type CountByTagsQueryResponse = {
  productCountByTags: { [key: string]: number };
  loading: boolean;
};

// UOM

export type UomAddMutationResponse = {
  uomsAdd: (mutation: { variables: MutationUomVariables }) => Promise<any>;
};

export type UomEditMutationResponse = {
  uomsEdit: (mutation: { variables: MutationUomVariables }) => Promise<any>;
};

export type UomRemoveMutationResponse = {
  uomsRemove: (mutation: { variables: { uomIds: string[] } }) => Promise<any>;
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
