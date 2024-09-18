import { QueryResponse } from "@erxes/ui/src/types";

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

export type ISyncRule = {
  _id: string;
  title: string;
  serviceName: string;
  responseKey?: string;
  extractType?: string;
  extractKey?: string;

  objectType: string;
  fieldGroup: string;
  formField: string;

  createdBy?: string;
  createdAt?: Date;
  updatedBy?: string;
  updatedAt?: Date;

  fieldGroupObj?: any;
  formFieldObj?: any;
};

export type SyncRulesQueryResponse = {
  xypSyncRules: ISyncRule[];
} & QueryResponse;

export type SyncRulesCountQueryResponse = {
  xypSyncRulesCount: number;
} & QueryResponse;

export type SyncRulesDetailQueryResponse = {
  xypSyncRulesDetail: ISyncRule;
} & QueryResponse;

export type MutationSyncRuleVariables = {
  _id?: string;
  name: string;
  code: string;
};

export type SyncRuleAddMutationResponse = {
  syncRulesAdd: (mutation: { variables: MutationSyncRuleVariables }) => Promise<any>;
};

export type SyncRuleEditMutationResponse = {
  syncRulesEdit: (mutation: { variables: MutationSyncRuleVariables }) => Promise<any>;
};

export type SyncRulesRemoveMutationResponse = {
  syncRulesRemove: (mutation: { variables: { _ids: string[] } }) => Promise<any>;
};

