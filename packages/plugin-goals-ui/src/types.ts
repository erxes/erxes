import {
  IAttachment,
  MutationVariables,
  QueryResponse
} from '@erxes/ui/src/types';

interface SpecificPeriodGoal {
  progress: string;
  _id: string;
  current: string;
  addMonthly: string;
  addTarget: string;
}

export interface IGoalTypeDoc {
  createdAt?: Date;
  entity: string;
  stageId: any;
  stageName: string;
  pipelineId: any;
  boardId: any;
  contributionType: string;
  metric: string;
  goalType: string;
  contribution: [string];
  department: string;
  unit: string;
  branch: string;
  specificPeriodGoals: SpecificPeriodGoal[];
  progress: {
    current: string;
    progress: string;
    amountData: string;
    target: string;
    _id: string;
  };
  chooseStage: string;
  startDate: string;
  endDate: string;
  target: string;
}

export interface ICommonTypes {
  _id?: string;
  createdAt?: Date;
  createdBy?: string;
  modifiedAt?: Date;
  modifiedBy?: string;

  title?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  finishDateOfUse?: Date;
  attachment?: IAttachment;

  status?: string;
}
export interface IAssignmentCampaign extends ICommonTypes {
  segmentIds?: string[];
  voucherCampaignId?: string;
}

export interface IGoalType extends IGoalTypeDoc {
  _id: string;
  map(arg0: (item: any, index: any) => void): import('react').ReactNode;
  forEach(arg0: (goal: any) => void): unknown;
}

// mutation types

export type EditMutationResponse = {
  goalTypesEdit: (params: { variables: IGoalType }) => Promise<any>;
};

export type RemoveMutationVariables = {
  goalTypeIds: string[];
};

export type RemoveMutationResponse = {
  goalTypesRemove: (params: {
    variables: RemoveMutationVariables;
  }) => Promise<any>;
};

export type MergeMutationVariables = {
  goalTypeIds: string[];
  goalTypeFields: any;
};

export type MergeMutationResponse = {
  goalTypesMerge: (params: {
    variables: MergeMutationVariables;
  }) => Promise<any>;
};

export type AddMutationResponse = {
  goalTypesAdd: (params: { variables: IGoalTypeDoc }) => Promise<any>;
};

export type ListQueryVariables = {
  page?: number;
  perPage?: number;
  ids?: string[];
  searchValue?: string;
  sortField?: string;
  sortDirection?: number;
};

type ListConfig = {
  name: string;
  label: string;
  order: number;
};
export type MainQueryResponse = {
  goalTypesMain: { list: IGoalType[]; totalCount: number };
  loading: boolean;
  refetch: () => void;
};

export type GoalTypesQueryResponse = {
  goalTypes: IGoalType[];
  loading: boolean;
  refetch: () => void;
};

export type ListConfigQueryResponse = {
  fieldsDefaultColumnsConfig: ListConfig[];
  loading: boolean;
};

export type DetailQueryResponse = {
  goalTypeDetail: IGoalType;
  loading: boolean;
};

export type CountQueryResponse = {
  loading: boolean;
  refetch: () => void;
};
