export interface IGoalTypeDoc {
  createdAt?: Date;
  entity: string;
  contributionType: string;
  chooseBoard: string;
  frequency: string;
  metric: string;
  goalType: string;
  contribution: string;
  chooseStage: string;
  startDate: string;
  endDate: string;
  target: string;
}

export interface IGoalType extends IGoalTypeDoc {
  _id: string;
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
