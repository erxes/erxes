// SETTINGS

import { QueryResponse } from '@erxes/ui/src/types';

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
  { key: 'create', value: 'Create' },
  { key: 'update', value: 'Update' },
  { key: 'delete', value: 'Delete' }
];

export type CheckSyncedDealsQueryResponse = {
  deals: any[];
} & QueryResponse;

export type CheckSyncedDealsTotalCountQueryResponse = {
  dealsTotalCount: number;
} & QueryResponse;

export type CheckSyncedMutationResponse = {
  manyToCheckSynced: (mutation: {
    variables: { ids: string[]; type: string };
  }) => Promise<any>;
};

export type ToSyncDealsMutationResponse = {
  manyToSyncDeals: (mutation: {
    variables: { dealIds: string[]; configStageId: string; dateType: string };
  }) => Promise<any>;
};

export type ToCheckProductsMutationResponse = {
  manyToCheckProducts: (mutation: {
    variables: { brandId: string };
  }) => Promise<any>;
};

export type ToCheckCategoriesMutationResponse = {
  manyToCheckCategories: (mutation: {
    variables: { brandId: string };
  }) => Promise<any>;
};

export type ToSyncCategoriesMutationResponse = {
  manyToSyncCategories: (mutation: {
    variables: { brandId: string; action: string; categories: any[] };
  }) => Promise<any>;
};

export type ToSyncProductsMutationResponse = {
  manyToSyncProducts: (mutation: {
    variables: { brandId: string; action: string; products: any[] };
  }) => Promise<any>;
};

export type CheckSyncedOrdersQueryResponse = {
  posOrders: any[];
} & QueryResponse;

export type CheckSyncedOrdersTotalCountQueryResponse = {
  posOrdersTotalCount: number;
} & QueryResponse;

export type ToSyncOrdersMutationResponse = {
  manyToSyncOrders: (mutation: {
    variables: { orderIds: string[] };
  }) => Promise<any>;
};

export type PosListQueryResponse = {
  posList: any[];
  loading: boolean;
  refetch: () => void;
};

export type OrderDetailQueryResponse = {
  posOrderDetail: any;
  loading: boolean;
  refetch: () => void;
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
