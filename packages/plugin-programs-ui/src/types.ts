export interface IProgram {
  _id: string;
  name?: string;
  code: string;
  category?: IProgramCategory;
  unitPrice: number;
  type?: string;
  createdAt?: Date;
  commentCount?: number;
}

export interface IProgramCategory {
  _id: string;
  name: string;
}

// queries
export type ProgramQueryResponse = {
  programs: { list: IProgram[]; totalCount: number };
  refetch: () => void;
  loading: boolean;
};
export type ProgramCategoriesQueryResponse = {
  programCategories: IProgramCategory[];
  loading: boolean;
  refetch: () => void;
};
export type ProgramCategoriesCountQueryResponse = {
  programCategoriesTotalCount: number;
  loading: boolean;
  refetch: () => void;
};
// mutations
export type MutationVariables = {
  _id?: string;
  name: string;
  createdAt?: Date;
  expiryDate?: Date;
  checked?: boolean;
  type?: string;
};
export type ProgramCategoryRemoveMutationResponse = {
  programCategoryRemove: (mutation: {
    variables: { _id: string };
  }) => Promise<any>;
};
export type AddMutationResponse = {
  addMutation: (params: { variables: MutationVariables }) => Promise<any>;
};

export type EditMutationResponse = {
  editMutation: (params: { variables: MutationVariables }) => Promise<any>;
};

export type RemoveMutationResponse = {
  removeMutation: (params: { variables: { _id: string } }) => Promise<any>;
};
