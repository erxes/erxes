import { QueryResponse } from 'modules/common/types';
import { IUser } from 'modules/auth/types';

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

  count?: number;
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

  count?: number;
};

export interface IAutomationDoc {
  name: string;
  status: string;
  triggers: ITrigger[];
  actions: IAction[];
  updatedAt?: Date;
  createdAt?: Date;
  updatedBy?: string;
  createdBy?: string;
  updatedUser?: IUser;
  createdUser?: IUser;
}

export interface IAutomationNoteDoc {
  triggerId: string;
  actionId: string;
  description: string;
  createdUser?: IUser;
  createdAt?: Date;
}

export interface IAutomation extends IAutomationDoc {
  _id: string;
}

export interface IAutomationHistoryAction {
  createdAt?: Date;
  actionId: string;
  actionType: string;
  actionConfig?: any;
  nextActionId?: string;
  result?: any;
}

export interface IAutomationHistory {
  _id: string;
  createdAt: Date;
  modifiedAt?: Date;
  automationId: string;
  triggerId: string;
  triggerType: string;
  triggerConfig?: any;
  nextActionId?: string;
  targetId: string;
  target: any;
  status: string;
  description: string;
  actions?: IAutomationHistoryAction[];
  startWaitingDate?: Date;
  waitingActionId?: string;
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
  automationsAddNote: (params: {
    variables: IAutomationNoteDoc;
  }) => Promise<any>;
};

export type RemoveNoteMutationResponse = {
  automationsRemoveNote: (params: {
    variables: RemoveNoteMutationVariables;
  }) => Promise<any>;
};

export type EditNoteMutationResponse = {
  automationsEditNote: (params: { variables: IAutomationNote }) => Promise<any>;
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

export type AutomationHistoriesQueryResponse = {
  automationHistories: IAutomationHistory[];
  loading: boolean;
};

export type Counts = {
  [key: string]: number;
};

export type AutomationsCount = {
  total: number;
  byStatus: Counts;
};

export type CountQueryResponse = {
  automationsTotalCount: AutomationsCount;
} & QueryResponse;
