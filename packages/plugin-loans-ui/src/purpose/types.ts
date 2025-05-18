export interface IPurposeDoc {
  code?: string;
  name?: string;
  order: string;
  isRoot: boolean;
  description?: string;
  parentId?: string;
}

export interface IPurpose extends IPurposeDoc {
  _id: string;
}

// mutation types

export type EditMutationResponse = {
  contractTypesEdit: (params: { variables: IPurpose }) => Promise<any>;
};

export type RemoveMutationVariables = {
  purposeIds: string[];
};

export type RemoveMutationResponse = {
  purposesRemove: (params: {
    variables: RemoveMutationVariables;
  }) => Promise<any>;
};

export type AddMutationResponse = {
  contractTypesAdd: (params: { variables: IPurposeDoc }) => Promise<any>;
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
  purposesMain: { list: IPurpose[]; totalCount: number };
  loading: boolean;
  refetch: () => void;
};
