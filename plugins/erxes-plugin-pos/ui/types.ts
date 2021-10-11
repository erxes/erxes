import { IProductCategory, IProduct } from 'erxes-ui/lib/products/types';

export type IConfigsMap = { [key: string]: any };

export type IConfig = {
  _id: string;
  code: string;
  value: any;
};

// query types
export type ConfigsQueryResponse = {
  configs: IConfig[];
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