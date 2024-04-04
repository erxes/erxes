export interface ISyncpolaris {
  _id: string;
  name?: string;
  createdAt?: Date;
  expiryDate?: Date;
  totalObjectCount?: number;
  checked?: boolean;
  typeId?: string;
  currentType?: IType;
}
export type IConfig = {
  _id: string;
  code: string;
  value: any;
};
export type ConfigsQueryResponse = {
  configsGetValue: IConfig;
  loading: boolean;
  refetch: () => void;
};
export type IConfigsMap = { [key: string]: any };

export interface IType {
  _id: string;
  name: string;
}

// queries
export type SyncpolarisQueryResponse = {
  syncpolariss: ISyncpolaris[];
  refetch: () => void;
  loading: boolean;
};
export type TypeQueryResponse = {
  syncpolarisTypes: IType[];
  refetch: () => void;
  loading: boolean;
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
