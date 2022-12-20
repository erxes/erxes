import { IJobRefer } from '../job/types';
import { IProduct } from '@erxes/ui-products/src/types';
import { IProductsData } from '../types';
import { QueryResponse } from '@erxes/ui/src/types';

export type IFlowCategory = {
  _id: string;
  name: string;
  order: string;
  code: string;
  description?: string;
  attachment?: any;
  status: string;
  parentId?: string;
  createdAt: Date;
  flowCount: number;
  isRoot: boolean;
};

interface IConfig {
  jobReferId?: string;
  productId?: string;
  subFlowId?: string;

  quantity?: number;

  durationType: string;
  duration: number;
  inBranchId?: string;
  inDepartmentId?: string;
  outBranchId?: string;
  outDepartmentId?: string;
}

export interface IJob {
  id: string;
  type: string;
  config: IConfig;
  nextJobIds?: string[];
  style?: any;
  label?: string;
  description?: string;
  icon?: string;
}

export interface IFlow {
  name: string;
  categoryId?: string;
  productId?: string;
  product?: IProduct;
  status: string;
  isSub?: boolean;
  flowValidation?: string;
  jobs?: IJob[];
  needProducts?: IProductsData[];
  resultProducts?: IProductsData[];
}

export interface IFlowDocument extends IFlow, Document {
  _id: string;
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
  jobCount: number;
  latestBranchId?: string;
  latestDepartmentId?: string;
  latestBranch?: any;
  latestDepartment?: any;
  latestNeedProducts?: IProductsData[];
  latestResultProducts?: IProductsData[];
}

// FLOW

export type FlowsQueryResponse = {
  flows: IFlowDocument[];
  refetch: (variables?: {
    searchValue?: string;
    isSub?: boolean;
    perPage?: number;
    categoryId?: string;
  }) => void;
} & QueryResponse;

export type FlowsAllQueryResponse = {
  flowsAll: IFlowDocument[];
} & QueryResponse;

export type FlowDetailQueryResponse = {
  flowDetail: IFlowDocument;
} & QueryResponse;

export type FlowsAddMutationResponse = {
  flowsAdd: (mutation: { variables: IFlow }) => Promise<any>;
};

export type FlowsEditMutationResponse = {
  flowsEdit: (mutation: { variables: IFlowDocument }) => Promise<any>;
};

export type flowTotalCountQueryResponse = {
  flowTotalCount: number;
} & QueryResponse;

export type FlowCategoriesQueryResponse = {
  flowCategories: any[];
} & QueryResponse;

export type FlowCategoriesCountQueryResponse = {
  flowCategoriesTotalCount: number;
} & QueryResponse;

// mutation types
export type flowsRemoveMutationResponse = {
  flowsRemove: (mutation: { variables: { flowIds: string[] } }) => Promise<any>;
};

export type DetailQueryResponse = {
  jobReferDetail: IJobRefer;
  loading: boolean;
};
