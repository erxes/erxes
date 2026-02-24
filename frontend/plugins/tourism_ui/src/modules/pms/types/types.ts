import { IAttachment } from 'erxes-ui';
import { ApolloError } from '@apollo/client';

export interface IProductCategory {
  _id: string;
  name: string;
  avatar?: IAttachment;
  code: string;
  order: string;
  productCount: number;
  parentId?: string;
}

export interface ProductCategoriesResponse {
  productCategories: IProductCategory[];
}

export interface UseProductCategoriesResult {
  productCategories: IProductCategory[] | undefined;
  loading: boolean;
  error: ApolloError | undefined;
}
