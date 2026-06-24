type QueryResponse = {
  loading?: boolean;
  refetch?: () => void;
};

export type IMSDynamicConfig = {
  title: string;
  brandId: string;
  itemApi: string;
  itemCategoryApi: string;
  pricePriority: string;
  priceApi: string;
  customerApi: string;
  salesApi: string;
  salesLineApi: string;
  exchangeRateApi: string;
  username: string;
  password: string;
  genBusPostingGroup: string;
  vatBusPostingGroup: string;
  paymentTermsCode: string;
  paymentMethodCode: string;
  customerPostingGroup: string;
  customerPricingGroup: string;
  customerDiscGroup: string;
  locationCode: string;
  reminderCode: string;
  responsibilityCenter: string;
  billType: string;
  dealType: string;
  syncType: string;
  defaultUserCode: string;
  defaultCompanyCode: string;
  useBoard: boolean;
  boardId: string;
  pipelineId: string;
  stageId: string;
  posConf: string;
  productUrl: string;
  custCode: string;               
  userLocationCode: string; 
};

export type IMSDynamicConfigMap = Record<string, IMSDynamicConfig>;

export type IConfigsMap = {
  DYNAMIC: IMSDynamicConfigMap;
};

export type IMnConfig = {
  _id: string;
  code: string;
  subId?: string;
  value: IMSDynamicConfig;
};

export type ConfigsQueryResponse = {
  mnConfigs: IMnConfig[];
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

export type ToSyncPricesMutationResponse = {
  toSyncMsdPrices: (mutation: {
    variables: { brandId: string };
  }) => Promise<any>;
};

export type ToCheckCategoriesMutationResponse = {
  toCheckMsdProductCategories: (mutation: {
    variables: { brandId: string; categoryId: string };
  }) => Promise<any>;
};

export type ToSyncCategoriesMutationResponse = {
  toSyncMsdProductCategories: (mutation: {
    variables: {
      brandId: string;
      action: string;
      categoryId: string;
      categories: any[];
    };
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

export type CheckSyncedMutationResponse = {
  toCheckMsdSynced: (mutation: {
    variables: { ids: string[] };
  }) => Promise<any>;
};

export type CheckSyncedOrdersQueryResponse = {
  posOrders: any[];
} & QueryResponse;

export type CheckSyncedOrdersTotalCountQueryResponse = {
  posOrdersTotalCount: number;
} & QueryResponse;

export type PosListQueryResponse = {
  posList: any[];
  loading: boolean;
  refetch: () => void;
};

export type ToSendOrdersMutationResponse = {
  toSendMsdOrders: (mutation: {
    variables: { orderIds: string[] };
  }) => Promise<any>;
};

export type OrderDetailQueryResponse = {
  posOrderDetail: any;
  loading: boolean;
  refetch: () => void;
};
