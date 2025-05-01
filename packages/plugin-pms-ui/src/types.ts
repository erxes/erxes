// SETTINGS

import { QueryResponse } from "@erxes/ui/src/types";

export type IConfigsMap = { [key: string]: any };

export type IConfig = {
  _id: string;
  code: string;
  value: any;
};

// query types
export type ConfigsQueryResponse = {
  multierkhetConfigsGetValue: IConfig;
  loading: boolean;
  refetch: () => void;
};

export const statusFilters = [
  { key: "create", value: "Create" },
  { key: "update", value: "Update" },
  { key: "delete", value: "Delete" },
];

// queries
export type PmsQueryResponse = {
  tms: IPmsBranch[];
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

export type IPmsBranch = {
  _id?: string;
  name?: string;
  description?: string;
  createdAt?: Date;
  token?: string;
  erxesAppToken?: string;
  user1Ids?: [string];
  user2Ids?: [string];
  user3Ids?: [string];
  user4Ids?: [string];
  user5Ids?: [string];

  paymentIds?: string[];
  paymentTypes?: any[];
  uiOptions?: any;
  permissionConfig?: any;
  user?: any;
  pipelineConfig?: any;
  roomCategories?: string[];
  extraProductCategories?: string[];
  time?: string;
  discount?: any;
  checkintime?: string;
  checkouttime?: string;
  checkinamount?: number;
  checkoutamount?: number;
};
