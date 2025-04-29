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
  accountsCount?: number;
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
  isTemp: boolean;
  isOutBalance: boolean;
  mergedIds?: string[];

  category?: IAccountCategory;
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
  accountsCount: number;
} & QueryResponse;

export type AddAccountMutationResponse = {
  addAccountMutation: (params: { variables: IAccount }) => Promise<IAccount>;
};

export type EditAccountMutationResponse = {
  editAccountMutation: (params: {
    variables: { _id: string } & IAccount;
  }) => Promise<IAccount>;
};

export type RemoveAccountMutationResponse = {
  removeAccountMutation: (params: {
    variables: { _id: string };
  }) => Promise<string>;
};

// categories
export type AccountCategoryDetailQueryResponse = {
  accountCategoryDetail: IAccountCategory;
} & QueryResponse;

export type AccountCategoriesQueryResponse = {
  accountCategories: IAccountCategory[];
} & QueryResponse;

export type AddAccountCategoryMutationResponse = {
  addAccountCategoryMutation: (params: { variables: IAccount }) => Promise<any>;
};

export type EditAccountCategoryMutationResponse = {
  editAccountCategoryMutation: (params: {
    variables: { _id: string } & IAccount;
  }) => Promise<any>;
};

export type RemoveAccountCategoryMutationResponse = {
  removeAccountCategoryMutation: (params: {
    variables: { _id: string };
  }) => Promise<string>;
};