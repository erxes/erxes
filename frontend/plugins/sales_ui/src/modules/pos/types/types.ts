import { IAttachment } from 'erxes-ui';
import { ApolloError } from '@apollo/client';

export interface PaymentType {
  _id: string;
  type: string;
  title: string;
  icon: string;
  config?: string;
}

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
