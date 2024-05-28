export interface IAccountCategory {
  _id: string;
  createdAt: Date;
  name: string;
  code: string;
  order: string;
  scopeBrandIds?: string[];
  description?: string;
  parentId?: string;
  status?: string;
  mergeIds?: string[];
  maskType?: string;
  mask?: any;
}

export interface IAccount {
  _id: string;
  createdAt: Date;
  code: string;
  name: string;
  categoryId?: string;
  parentId?: string;
  currency: string;
  kind: string;
  journal: string;
  description?: string;
  branchId?: string;
  departmentId?: string;
  scopeBrandIds?: string[];
  status: string;
  isOutBalance: boolean;
  mergedIds?: string[];
}

export type QueryResponse = {
  loading: boolean;
  refetch: () => void;
  error?: string;
};

export type AccountDetailQueryResponse = {
  accountDetail: IAccount;
} & QueryResponse;

export type AccountsQueryResponse = {
  accounts: IAccount[];
} & QueryResponse;

export type AccountsCountQueryResponse = {
  accounts: IAccount[];
} & QueryResponse;

export interface IAccountsTotalCountResponse {
  accountsTotalCount: number;
}

export interface IAccountCategoryResponse {
  accountCategories: IAccountCategory[];
}

export interface IAccountCategoriesTotalCountResponse {
  accountCategoriesTotalCount: number;
}