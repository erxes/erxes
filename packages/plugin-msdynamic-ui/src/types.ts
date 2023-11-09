export type IConfigsMap = { [key: string]: any };

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
export interface IDynamic {
  _id?: string;
  endPoint?: string;
  username?: string;
  password?: string;
}

// queries
export type MsdynamicQueryResponse = {
  msdynamicConfigs: IDynamic[];
  refetch: () => void;
  loading: boolean;
};

// mutations
export type MutationVariables = {
  _id?: string;
  endPoint?: string;
  username?: string;
  password?: string;
};
export type AddMutationResponse = {
  addMutation: (params: { variables: MutationVariables }) => Promise<any>;
};

export type EditMutationResponse = {
  editMutation: (params: { variables: MutationVariables }) => Promise<any>;
};

export type ToSyncProductsMutationResponse = {
  toSyncProducts: (mutation: {
    variables: { action: string; products: any[] };
  }) => Promise<any>;
};

export type ToCheckProductsMutationResponse = {
  toCheckProducts: (mutation: { variables: {} }) => Promise<any>;
};
