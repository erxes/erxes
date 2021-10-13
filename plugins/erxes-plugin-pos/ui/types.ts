import { IProductCategory, IProduct } from 'erxes-ui/lib/products/types';

export type IConfigsMap = { [key: string]: any };

export type IPosConfig = {
  _id: string;
  posId: string;
  code: string;
  value: any;
};

// query types
export type ConfigsQueryResponse = {
  posConfigs: IPosConfig[];
  loading: boolean;
  refetch: () => void;
};


export type IProductGroup = {
  _id: string;
  name: string;
  description: string;
  categories: IProductCategory[];
  excludedCategories: IProductCategory[];
  excludedProducts: IProduct[];
}

export type IPos = {
  _id: string;
  name: string;
  description: string;
}

export type PosListQueryResponse = {
  allPos: IPos[];
  loading: boolean;
  refetch: () => void;
};


export type PosRemoveMutationResponse = {
  removePos: (mutation: { variables: { _id: string } }) => Promise<any>;
};
