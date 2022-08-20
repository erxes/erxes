export interface IAdjustmentDoc {
  date: Date;
  createdBy: string;
  createdAt: Date;
}

export interface IAdjustment extends IAdjustmentDoc {
  _id: string;
}

export interface IAdjustmentDetail extends IAdjustment {}

// mutation types

export type EditMutationResponse = {
  adjustmentsEdit: (params: { variables: IAdjustment }) => Promise<any>;
};

export type RemoveMutationVariables = {
  adjustmentIds: string[];
};

export type RemoveMutationResponse = {
  adjustmentsRemove: (params: {
    variables: RemoveMutationVariables;
  }) => Promise<any>;
};

export type AddMutationResponse = {
  adjustmentsAdd: (params: { variables: IAdjustmentDoc }) => Promise<any>;
};

// query types

export type ListQueryVariables = {
  page?: number;
  perPage?: number;
  startDate?: Date;
  endDate?: Date;
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
  adjustmentsMain: { list: IAdjustment[]; totalCount: number };
  loading: boolean;
  refetch: () => void;
};

export type AdjustmentsQueryResponse = {
  adjustments: IAdjustment[];
  loading: boolean;
  refetch: () => void;
};

export type ListConfigQueryResponse = {
  fieldsDefaultColumnsConfig: ListConfig[];
  loading: boolean;
};

export type DetailQueryResponse = {
  adjustmentDetail: IAdjustmentDetail;
  loading: boolean;
};

export type CountQueryResponse = {
  loading: boolean;
  refetch: () => void;
};
