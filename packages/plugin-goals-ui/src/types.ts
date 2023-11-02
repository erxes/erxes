import { IAttachment } from '@erxes/ui/src/types';

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
  specificPeriodGoals: {
    map(
      arg0: (element: any, index: any) => JSX.Element
    ): import('react').ReactNode;
    progress: string;
    _id: string;
    current: string;
    addMonthly: string;
    addTarget: string;
  };
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
  segmentIds: string[];
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
  goalTypesMain: { list: IGoalType[]; totalCount: number };
  loading: boolean;
  refetch: () => void;
};

export type GoalTypesQueryResponse = {
  goalTypes: IGoalType[];
  loading: boolean;
  refetch: () => void;
};

export type DetailQueryResponse = {
  goalTypeDetail: IGoalType;
  loading: boolean;
};
