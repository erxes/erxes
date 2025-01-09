// queries
export type BmQueryResponse = {
  bms: IBmsBranch[];
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

export type IBmsBranch = {
  _id?: string;
  name?: string;
  description?: string;
  createdAt?: Date;
  token?: string;
  erxesAppToken?: string;
  user1Ids?: [string];
  user2Ids?: [string];
  paymentIds?: string[];
  paymentTypes?: any[];
  uiOptions?: any;
  permissionConfig?: any;
  user?: any;
};
