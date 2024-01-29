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

export type ToCheckProductsMutationResponse = {
  toCheckMsdProducts: (mutation: {
    variables: { brandId: string };
  }) => Promise<any>;
};

export type ToSyncProductsMutationResponse = {
  toSyncMsdProducts: (mutation: {
    variables: { brandId: string; action: string; products: any[] };
  }) => Promise<any>;
};

export type ToCheckPricesMutationResponse = {
  toCheckMsdPrices: (mutation: {
    variables: { brandId: string };
  }) => Promise<any>;
};

export type ToSyncPricesMutationResponse = {
  toSyncMsdPrices: (mutation: {
    variables: { brandId: string; action: string; prices: any[] };
  }) => Promise<any>;
};

export type ToCheckCategoriesMutationResponse = {
  toCheckMsdProductCategories: (mutation: {
    variables: { brandId: string };
  }) => Promise<any>;
};

export type ToSyncCategoriesMutationResponse = {
  toSyncMsdProductCategories: (mutation: {
    variables: { brandId: string; action: string; categories: any[] };
  }) => Promise<any>;
};

export type ToCheckCustomersMutationResponse = {
  toCheckMsdCustomers: (mutation: {
    variables: { brandId: string };
  }) => Promise<any>;
};

export type ToSyncCustomersMutationResponse = {
  toSyncMsdCustomers: (mutation: {
    variables: { brandId: string; action: string; customers: any[] };
  }) => Promise<any>;
};

export type SyncHistoriesQueryResponse = {
  syncMsdHistories: any[];
  loading: boolean;
  refetch: () => void;
};

export type SyncHistoriesCountQueryResponse = {
  syncMsdHistoriesCount: number;
  loading: boolean;
  refetch: () => void;
};
