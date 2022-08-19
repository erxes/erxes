import { QueryResponse } from '../types';

export interface IBrand {
  _id: string;
  code: string;
  name?: string;
  createdAt: string;
  description?: string;
  emailConfig: { type: string; template: string };
}

export interface IBrandDoc extends IBrand {
  integrations: any[]; //check - IIntegration
}

// queries
export type BrandsQueryResponse = {
  brands: IBrand[];
} & QueryResponse;

export type BrandDetailQueryResponse = {
  brandDetail: IBrand;
} & QueryResponse;

export type BrandsGetLastQueryResponse = {
  brandsGetLast: IBrand;
} & QueryResponse;

export type BrandsCountQueryResponse = {
  brandsTotalCount: number;
} & QueryResponse;
