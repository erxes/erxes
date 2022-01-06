import { ICompany } from '../companies/types';
import { ITag } from '../tags/types';
import { QueryResponse } from '../types';

export interface IProductDoc {
  _id?: string;
  type: string;
  name?: string;
  description?: string;
  sku?: string;
  createdAt?: Date;
  customFieldsData?: any;
}

export interface IProduct {
  _id: string;
  name: string;
  type: string;
  categoryId: string;
  description: string;
  getTags?: ITag[];
  sku: string;
  code: string;
  unitPrice: number;
  customFieldsData?: any;
  createdAt: Date;
  vendorId?: string;

  attachment?: any;
  attachmentMore?: any[];
  supply: string;
  productCount: number;
  minimiumCount: number;
  category: IProductCategory;
  vendor?: ICompany;
}

export interface IProductCategory {
  _id: string;
  name: string;
  order: string;
  code: string;
  description?: string;
  attachment?: any;
  status: string;
  parentId?: string;
  createdAt: Date;
  productCount: number;
  isRoot: boolean;
}

export type ProductsQueryResponse = {
  loading: boolean;
  refetch: (variables?: { searchValue?: string; perPage?: number }) => void;
  products: IProduct[];
};

export type ProductCategoriesQueryResponse = {
  productCategories: IProductCategory[];
} & QueryResponse;

export type ProductAddMutationResponse = {
  productAdd: (params: { variables: IProductDoc }) => Promise<void>;
};
