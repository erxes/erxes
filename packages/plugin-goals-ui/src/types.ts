export interface ISpecificPeriodGoal {
  progress: string;
  _id: string;
  current: string;
  addMonthly: string;
  addTarget: number;
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
  goalTypeChoose: string;
  contribution: [string];
  department: string[];
  unit: string[];
  branch: string[];
  specificPeriodGoals: ISpecificPeriodGoal[];
  progress: {
    current: string;
    progress: string;
    amountData: string;
    target: number;
    _id: string;
  };
  chooseStage: string;
  startDate: Date;
  endDate: Date;
  target: number;
  segmentIds: string[];
  stageRadio: boolean;
  segmentRadio: boolean;
  periodGoal: string;
  teamGoalType: string;
  segmentCount: number;
}

export interface IGoalType extends IGoalTypeDoc {
  length: number;
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
