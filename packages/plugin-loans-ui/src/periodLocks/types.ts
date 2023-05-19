export interface IPeriodLockDoc {
  date: Date;
  createdBy: string;
  createdAt: Date;
  excludeContracts: string[];
}

export interface IPeriodLock extends IPeriodLockDoc {
  _id: string;
}

export interface IPeriodLockDetail extends IPeriodLock {}

// mutation types

export type EditMutationResponse = {
  periodLocksEdit: (params: { variables: IPeriodLock }) => Promise<any>;
};

export type RemoveMutationVariables = {
  periodLockIds: string[];
};

export type RemoveMutationResponse = {
  periodLocksRemove: (params: {
    variables: RemoveMutationVariables;
  }) => Promise<any>;
};

export type AddMutationResponse = {
  periodLocksAdd: (params: { variables: IPeriodLockDoc }) => Promise<any>;
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
  periodLocksMain: { list: IPeriodLock[]; totalCount: number };
  loading: boolean;
  refetch: () => void;
};

export type PeriodLocksQueryResponse = {
  periodLocks: IPeriodLock[];
  loading: boolean;
  refetch: () => void;
};

export type ListConfigQueryResponse = {
  fieldsDefaultColumnsConfig: ListConfig[];
  loading: boolean;
};

export type DetailQueryResponse = {
  periodLockDetail: IPeriodLockDetail;
  loading: boolean;
};

export type CountQueryResponse = {
  loading: boolean;
  refetch: () => void;
};
