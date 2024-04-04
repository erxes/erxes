export interface IDictionary {
  _id: string;
  name: string;
  createdAt?: Date;
  code?: string;
  type: string;
  isParent: boolean;
  createdBy?: string;
  checked?: boolean;
  parentId?: string;
}
export interface IZms {
  _id: string;
  customer: {
    o_c_customer_information: {
      o_c_customercode: string;
      o_c_customername: string;
      o_c_registerno: string;
    };
  };
  checked?: boolean;
}
export interface ILog {
  _id: string;
  createdAt: Date;
  zmsId: string;
  action: string;
  status: string;
  checked?: boolean;
}
export interface IParent {
  _id: string;
  name: string;
  isParent: boolean;
  parentId?: string;
}

// queries
export type ZmsQueryResponse = {
  getDictionaries: IDictionary[];
  refetch: () => void;
  loading: boolean;
};
export type ZmsResponse = {
  getZmses: IZms[];
  refetch: () => void;
  loading: boolean;
};

export type LogResponse = {
  getZmsLogs: ILog[];
  refetch: () => void;
  loading: boolean;
};
export type ParentQueryResponse = {
  getDictionaries: IParent[];
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
