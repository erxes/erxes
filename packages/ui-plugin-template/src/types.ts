export interface I{Name} {
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

// queries
export type {Name}QueryResponse = {
  {name}s: I{Name}[];
  refetch: () => void;
  loading: boolean;
};
export type TypeQueryResponse = {
  {name}Types: IType[];
  refetch: () => void;
  loading: boolean;
};

// mutations
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

// export type {Name}MutationVariables = {
//   type: string;
//   targetIds: string[];
//   tagIds: string[];
// };
