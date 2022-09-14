export interface ITest {
  _id: string;
  name?: string;
  createdAt?: Date;
  expiryDate?: Date;
  totalObjectCount?: number;
  checked?: boolean;
  typeId?: string;
  currentType?: IType;
}

export interface IType {
  _id: string;
  name: string;
}

export interface ITypeSaveParams {
  type?: IType;
  doc: {
    _id?: String;
    name: String;
  };
  callback?: () => void;
}

export interface ITagSaveParams {
  test?: ITest;
  doc: {
    _id?: String;
    name: String;
    createdAt?: Date;
    expiryDate?: Date;
  };
  callback?: () => void;
}

// queries
export type TestQueryResponse = {
  tests: ITest[];
  refetch: () => void;
  loading: boolean;
};
export type TypeQueryResponse = {
  types: IType[];
  refetch: () => void;
  loading: boolean;
};

//mutations
export type MutationVariables = {
  _id?: String;
  name: String;
  createdAt?: Date;
  expiryDate?: Date;
  checked?: Boolean;
  type?: string;
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

export type EditTypeMutationResponse = {
  typesEdit: (params: { variables: MutationVariables }) => Promise<any>;
};

export type RemoveTypeMutationResponse = {
  typesRemove: (params: { variables: { _id: string } }) => Promise<any>;
};

// export type TestMutationVariables = {
//   type: string;
//   targetIds: string[];
//   tagIds: string[];
// };
