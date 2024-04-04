export interface IXyp {
  _id: string;
  name?: string;
  url?: string;
  token?: string;
  createdAt?: Date;
  totalObjectCount?: number;
  checked?: boolean;
}

export interface IType {
  _id: string;
  name: string;
}

// queries
export type XypQueryResponse = {
  xyps: IXyp[];
  refetch: () => void;
  loading: boolean;
};
export type TypeQueryResponse = {
  xypTypes: IType[];
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

export interface IOperation {
  orgName: string;
  wsOperationDetail: string;
  wsOperationName: string; //"WS100101_getCitizenIDCardInfo"
  wsVersion: string; //"1.3.0"
  wsWsdlEndpoint: string; // 'https://xyp.gov.mn/citizen-1.3.0/ws?WSDL';
  input: [];
  output: [];
}
