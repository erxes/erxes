import {
  IAccount as IAccountC,
  IAccountCategory as IAccountCategoryC,
  IAccountDoc as IAccountDocC
} from '@erxes/ui-accounts/src/types';
import { QueryResponse } from '@erxes/ui/src/types';

export type IAccountDoc = IAccountDocC & {};

export type IAccount = IAccountC & {};

export type IAccountCategory = IAccountCategoryC & {};

export type Counts = {
  [key: string]: number;
};
type AccountCounts = {
  bySegment: Counts;
  byTag: Counts;
};
// query types

export type AccountsQueryResponse = {
  accounts: IAccount[];
} & QueryResponse;

export type AccountsCountQueryResponse = {
  accountsTotalCount: number;
} & QueryResponse;

export type AccountsGroupCountsQueryResponse = {
  accountsGroupsCounts: AccountCounts;
} & QueryResponse;

export type AccountCategoriesCountQueryResponse = {
  accountCategoriesTotalCount: number;
} & QueryResponse;

// UOM

export type UomsCountQueryResponse = {
  uomsTotalCount: number;
} & QueryResponse;

export type MutationVariables = {
  _id?: string;
  type: string;
  name?: string;
  code?: string;
  createdAt?: Date;
};

export type MutationUomVariables = {
  _id?: string;
  name: string;
  code: string;
};

// mutation types

export type AddMutationResponse = {
  addMutation: (mutation: { variables: MutationVariables }) => Promise<any>;
};

export type EditMutationResponse = {
  editMutation: (mutation: { variables: MutationVariables }) => Promise<any>;
};

export type AccountRemoveMutationResponse = {
  accountsRemove: (mutation: {
    variables: { accountIds: string[] };
  }) => Promise<any>;
};

export type AccountCategoryRemoveMutationResponse = {
  accountCategoryRemove: (mutation: {
    variables: { _id: string };
  }) => Promise<any>;
};

export type DetailQueryResponse = {
  accountDetail: IAccount;
  loading: boolean;
};

export type CategoryDetailQueryResponse = {
  accountCategoryDetail: IAccountCategory;
  loading: boolean;
};

export type CountByTagsQueryResponse = {
  accountCountByTags: { [key: string]: number };
  loading: boolean;
};

export type MergeMutationVariables = {
  accountIds: string[];
  accountFields: IAccount;
};

export type MergeMutationResponse = {
  accountsMerge: (params: {
    variables: MergeMutationVariables;
  }) => Promise<any>;
};

export type IConfigsMap = { [key: string]: any };

export type IAccountsConfig = {
  _id: string;
  code: string;
  value: any;
};

// query types
export type AccountsConfigsQueryResponse = {
  accountsConfigs: IAccountsConfig[];
  loading: boolean;
  refetch: () => void;
};
