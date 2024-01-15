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
  toCheckProducts: (mutation: {
    variables: { brandId: string };
  }) => Promise<any>;
};

export type ToSyncProductsMutationResponse = {
  toSyncProducts: (mutation: {
    variables: { brandId: string; action: string; products: any[] };
  }) => Promise<any>;
};

export type ToCheckPricesMutationResponse = {
  toCheckPrices: (mutation: { variables: { brandId: string } }) => Promise<any>;
};

export type ToSyncPricesMutationResponse = {
  toSyncPrices: (mutation: {
    variables: { brandId: string; action: string; prices: any[] };
  }) => Promise<any>;
};

export type ToCheckCategoriesMutationResponse = {
  toCheckProductCategories: (mutation: {
    variables: { brandId: string };
  }) => Promise<any>;
};

export type ToSyncCategoriesMutationResponse = {
  toSyncProductCategories: (mutation: {
    variables: { brandId: string; action: string; categories: any[] };
  }) => Promise<any>;
};

export type ToCheckCustomersMutationResponse = {
  toCheckCustomers: (mutation: {
    variables: { brandId: string };
  }) => Promise<any>;
};

export type ToSyncCustomersMutationResponse = {
  toSyncCustomers: (mutation: {
    variables: { brandId: string; action: string; customers: any[] };
  }) => Promise<any>;
};

export type SyncHistoriesQueryResponse = {
  syncHistories: any[];
  loading: boolean;
  refetch: () => void;
};

export type SyncHistoriesCountQueryResponse = {
  syncHistoriesCount: number;
  loading: boolean;
  refetch: () => void;
};
