export interface IPeriodLockDoc {
  date: Date;
  createdBy: string;
  createdAt: Date;
  excludeContracts: string[];
}

export interface IPeriodLock extends IPeriodLockDoc {
  _id: string;
}

interface IGeneralRow {
  amount: number;
  account: string;
  side: 'kt' | 'dt';
}

export interface IGeneral {
  contractId?: string;
  customerId?: string;
  transactionId?: string;
  description?: string;
  payDate: Date;
  generalNumber: string;
  amount?: number;
  periodLockId: string;
  dtl?: IGeneralRow[];
}

export interface IPeriodLockDetail extends IPeriodLock {
  generals: IGeneral[];
}

// mutation types

export type EditMutationResponse = {
  classificationHistoryEdit: (params: {
    variables: IPeriodLock;
  }) => Promise<any>;
};

export type RemoveMutationVariables = {
  classificationIds: string[];
};

export type RemoveMutationResponse = {
  classificationRemove: (params: {
    variables: RemoveMutationVariables;
  }) => Promise<any>;
};

export type AddMutationResponse = {
  classificationHistoryAdd: (params: {
    variables: IPeriodLockDoc;
  }) => Promise<any>;
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
  classifications: { list: IPeriodLock[]; totalCount: number };
  loading: boolean;
  refetch: () => void;
};

export type ClassificationHistoryQueryResponse = {
  classificationHistory: IPeriodLock[];
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
