import { QueryResponse } from '@erxes/ui/src/types';
import { IProductsData } from '../types';

// query types
export interface IJobCategory {
  _id: string;
  name: string;
  code: string;
  description?: string;
  parentId?: string;
  attachment?: any;
  status?: string;
  order: string;
  createdAt: Date;
  isRoot: boolean;
  productCount: number;
}

export interface IJobRefer {
  _id: string;
  createdAt: Date;
  code: string;
  name: string;
  type: string;
  status?: string;
  categoryId?: string;
  duration: number;
  durationType: string;
  needProducts?: IProductsData[];
  resultProducts?: IProductsData[];
}

// JOB

export type JobReferDetailQueryResponse = {
  jobReferDetail: IJobRefer;
  loading: boolean;
};

export type JobRefersQueryResponse = {
  jobRefers: IJobRefer[];
  refetch: (variables?: {
    searchValue?: string;
    perPage?: number;
    categoryId?: string;
    types?: string[];
  }) => void;
} & QueryResponse;

export type jobReferTotalCountQueryResponse = {
  jobReferTotalCount: number;
} & QueryResponse;

export type JobCategoriesQueryResponse = {
  jobCategories: IJobCategory[];
} & QueryResponse;

export type JobCategoriesCountQueryResponse = {
  jobCategoriesTotalCount: number;
} & QueryResponse;

export type MutationJobReferVariables = {};

export type JobRefersAddMutationResponse = {
  addMutation: (mutation: {
    variables: MutationJobReferVariables;
  }) => Promise<any>;
};

export type JobRefersEditMutationResponse = {
  editMutation: (mutation: {
    variables: MutationJobReferVariables;
  }) => Promise<any>;
};

export type jobRefersRemoveMutationResponse = {
  jobRefersRemove: (mutation: {
    variables: { jobRefersIds: string[] };
  }) => Promise<any>;
};

export type JobCategoriesRemoveMutationResponse = {
  jobCategoriesRemove: (mutation: {
    variables: { _id: string };
  }) => Promise<any>;
};
