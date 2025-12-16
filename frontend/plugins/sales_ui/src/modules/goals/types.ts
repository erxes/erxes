import { IPipelineLabel } from '~/modules/deals/types/pipelines';

export type GoalEntity = "task" | "ticket" | "purchase" | "deal";

export interface ISpecificPeriodGoal {
  progress: string;
  _id: string;
  current: string;
  addMonthly: string;
  addTarget: number;
}

export interface IGoalTypeDoc {
  _id: string;
  createdAt?: Date;

  name: string;
  entity: GoalEntity;

  stageId?: string;
  stageName?: string;

  pipelineId?: string;
  boardId?: string;

  contributionType?: string;
  metric?: string;
  goalTypeChoose?: string;

  contribution?: string[] | number | string;

  department?: string[];
  unit?: string[];
  branch?: string[];

  specificPeriodGoals?: ISpecificPeriodGoal[];

  chooseStage?: string;

  startDate?: Date | string;
  endDate?: Date | string;

  segmentIds?: string[];
  stageRadio?: boolean;
  segmentRadio?: boolean;

  periodGoal?: string;

  teamGoalType?: string;
  segmentCount?: number;

  pipelineLabels?: IPipelineLabel[];
  productIds?: string[];
  companyIds?: string[];
  tagsIds?: string[];
}



export interface IGoalType extends IGoalTypeDoc {
}

// If you need an array type, create a separate one
export type IGoalTypeArray = IGoalType[];

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

export type MainQueryResponse = {
  goalTypesMain: {
    list: IGoalType[];
    totalCount: number;
  };
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

export interface GoalFormType {
  _id?: string;
  createdAt?: Date;
  name: string;
  entity: GoalEntity;
  stageId: string | null;
  stageName?: string;
  pipelineId: string | null;
  boardId: string | null;
  contributionType: string; 
  metric: string; 
  goalTypeChoose: string; 
  contribution: string[];
  department: string[];
  unit: string[];
  branch: string[];
  specificPeriodGoals: ISpecificPeriodGoal[];
  chooseStage?: string;
  startDate: Date | null;
  endDate: Date | null;
  segmentIds: string[];
  stageRadio: boolean;
  segmentRadio: boolean;
  periodGoal: string; 
  period?: string;
  teamGoalType: string; 
  segmentCount?: number;
  pipelineLabels?: any[];
  selectedLabelIds?: string[];
  productIds: string[];
  companyIds: string[];
  tagsIds: string[];
}

