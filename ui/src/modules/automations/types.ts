import { QueryResponse } from 'modules/common/types';

export type IAction = {
  id: string;
  type: string;
  icon?: string;
  label?: string;
  description?: string;
  nextActionId?: string;
  isAvailable?: boolean;
  style?: any;
  config?: any;
};

export type ITrigger = {
  id: string;
  type: string;
  icon?: string;
  label?: string;
  description?: string;
  actionId?: string;
  style?: any;
  config?: any;
};

export interface IAutomationDoc {
  name: string;
  status: string;
  triggers: ITrigger[];
  actions: IAction[];
  updatedAt?: Date;
  createdAt?: Date;
}

export interface IAutomationNoteDoc {
  automationId: string;
  triggerId: string;
  actionId: string;
  description: string;
}

export interface IAutomation extends IAutomationDoc {
  _id: string;
}

export interface IAutomationNote extends IAutomationNoteDoc {
  _id: string;
}

// mutation types

export type EditMutationResponse = {
  editAutomationMutation: (params: { variables: IAutomation }) => Promise<any>;
};

export type RemoveMutationVariables = {
  automationIds: string[];
};

export type RemoveNoteMutationVariables = {
  _id: string;
};

export type RemoveMutationResponse = {
  automationsRemove: (params: {
    variables: RemoveMutationVariables;
  }) => Promise<any>;
};

export type AddMutationResponse = {
  addAutomationMutation: (params: {
    variables: IAutomationDoc;
  }) => Promise<any>;
};

export type AddNoteMutationResponse = {
  addNoteAutomationMutation: (params: {
    variables: IAutomationNoteDoc;
  }) => Promise<any>;
};

export type RemoveNoteMutationResponse = {
  automationsNoteRemove: (params: {
    variables: RemoveNoteMutationVariables;
  }) => Promise<any>;
};

export type EditNoteMutationResponse = {
  editNoteAutomationMutation: (params: {
    variables: IAutomationNote;
  }) => Promise<any>;
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

export type AutomationsNoteQueryResponse = {
  automationNotes: IAutomationNote[];
} & QueryResponse;

export type DetailQueryResponse = {
  automationDetail: IAutomation;
  loading: boolean;
};
