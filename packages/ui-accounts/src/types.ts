import { ICompany } from '@erxes/ui-contacts/src/companies/types';
import { ITag } from '@erxes/ui-tags/src/types';
import { QueryResponse } from '@erxes/ui/src/types';

export interface IAccountDoc {
  _id?: string;
  type: string;
  name?: string;
  createdAt?: Date;
  customFieldsData?: any;
}

export interface IAccount {
  _id: string;
  name: string;
  type: string;
  categoryId: string;
  code: string;
  category: IAccountCategory;
  customFieldsData?: any;
  currency?: number;
  isbalance?: boolean;
  closePercent?: number;
  journal?: string;
  createdAt: Date;
  accountCount: number;
}

export interface IAccountCategory {
  _id: string;
  name: string;
  order: string;
  code: string;
  status: string;
  parentId?: string;
  createdAt: Date;
  isRoot: boolean;
  accountCount: number;
}

export type MutationVariables = {
  _id?: string;
  type: string;
  name?: string;
  createdAt?: Date;
};

export type DetailQueryResponse = {
  accountDetail: IAccount;
  loading: boolean;
};

// mutation types

export type AccountRemoveMutationResponse = {
  accountsRemove: (mutation: {
    variables: { accountIds: string[] };
  }) => Promise<any>;
};

export type AccountsQueryResponse = {
  loading: boolean;
  refetch: (variables?: { searchValue?: string; perPage?: number }) => void;
  accounts: IAccount[];
};

export type AccountAddMutationResponse = {
  accountAdd: (params: { variables: IAccountDoc }) => Promise<void>;
};

export type AccountCategoriesQueryResponse = {
  accountCategories: IAccountCategory[];
} & QueryResponse;

export type AccountsQueryResponses = {
  accounts: IAccount[];
} & QueryResponse;

export type EditMutationResponse = {
  editMutation: (mutation: { variables: MutationVariables }) => Promise<any>;
};

//

// SETTINGS

export type IConfigsMap = { [key: string]: any };

export type IAccountsConfig = {
  _id: string;
  code: string;
  value: any;
};

export type AccountsConfigsQueryResponse = {
  accountsConfigs: IAccountsConfig[];
  loading: boolean;
  refetch: () => void;
};
