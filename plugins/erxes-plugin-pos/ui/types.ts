import { IProductCategory, IProduct } from 'erxes-ui/lib/products/types';

export type IConfigsMap = { [key: string]: any };

// types 
export type IPosConfig = {
  _id: string;
  posId: string;
  code: string;
  value: any;
};

export type IProductGroup = {
  _id: string;
  name: string;
  description: string;
  categoryIds: string[];
  excludedCategyIds: string[];
  excludedProductIds: string[];
  categories: IProductCategory[];
  excludedCategories: IProductCategory[];
  excludedProducts: IProduct[];
}

export type IPos = {
  _id: string;
  name: string;
  description: string;
}

// query types
export type ConfigsQueryResponse = {
  posConfigs: IPosConfig[];
  loading: boolean;
  refetch: () => void;
};

export type PosListQueryResponse = {
  allPos: IPos[];
  loading: boolean;
  refetch: () => void;
};

export type GroupsQueryResponse = {
  productGroups: IProductGroup[];
  loading: boolean;
  refetch: () => void;
};


// mutation types
export type PosRemoveMutationResponse = {
  removePos: (mutation: { variables: { _id: string } }) => Promise<any>;
};
