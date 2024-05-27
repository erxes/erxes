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
  actions: any[];
  updatedAt?: Date;
  createdAt?: Date;
  updatedBy?: string;
  createdBy?: string;
  updatedUser?: any;
  createdUser?: any;
}

export interface IAutomationNoteDoc {
  triggerId: string;
  actionId: string;
  description: string;
  createdUser?: any;
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

export type EditMutationResponse = {
  editAutomationMutation: (params: { variables: IAutomation }) => Promise<any>;
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
  automationsRemoveNote: (params: { variables: any }) => Promise<any>;
};

export type EditNoteMutationResponse = {
  automationsEditNote: (params: { variables: IAutomationNote }) => Promise<any>;
};

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
} & any;

export type AutomationsQueryResponse = {
  automations: IAutomation[];
} & any;

export type AutomationsNoteQueryResponse = {
  automationNotes: IAutomationNote[];
} & any;

export type DetailQueryResponse = {
  automationDetail: IAutomation;
  loading: boolean;
};

export type AutomationHistoriesQueryResponse = {
  automationHistories: IAutomationHistory[];
  loading: boolean;
};

export type AutomationsCount = {
  total: number;
  byStatus: any;
};

export type CountQueryResponse = {
  automationsTotalCount: AutomationsCount;
} & any;

export type AutomationConstants = {
  triggersConst: ITrigger[];
  triggerTypesConst: string[];
  actionsConst: any[];
  propertyTypesConst: any[];
};

export type AutomationConstantsQueryResponse = {
  automationConstants: AutomationConstants;
} & any;
