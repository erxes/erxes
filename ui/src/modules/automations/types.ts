import { QueryResponse } from 'modules/common/types';

export type IAction = {
  id: number;
  type: string;
  nextActionId?: string;
  style?: any;
  config?: any;
};

export type ITrigger = {
  id: number;
  type: string;
  actionId?: string;
  style?: any;
};

export interface IAutomationDoc {
  name: string;
  status: string;
  triggers: ITrigger[];
  actions: IAction[];
}

export interface IAutomation extends IAutomationDoc {
  _id: string;
}

// mutation types

export type EditMutationResponse = {
  automationsEdit: (params: { variables: IAutomation }) => Promise<any>;
};

export type RemoveMutationVariables = {
  automationIds: string[];
};

export type RemoveMutationResponse = {
  automationsRemove: (params: {
    variables: RemoveMutationVariables;
  }) => Promise<any>;
};

export type AddMutationResponse = {
  automationsAdd: (params: { variables: IAutomationDoc }) => Promise<any>;
};

// query types
export type ListQueryVariables = {
  page?: number;
  perPage?: number;
  ids?: string[];
  searchValue?: string;
  sortField?: string;
  sortDirection?: number;
};

export type MainQueryResponse = {
  automationsMain: { list: IAutomation[]; totalCount: number };
} & QueryResponse;

export type AutomationsQueryResponse = {
  automations: IAutomation[];
} & QueryResponse;

export type DetailQueryResponse = {
  automationDetail: IAutomation;
  loading: boolean;
};
