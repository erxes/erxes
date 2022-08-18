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
  configs: IConfig[];
  loading: boolean;
  refetch: () => void;
};

export type CheckSyncedDealsQueryResponse = {
  deals: any[];
} & QueryResponse;

export type CheckSyncedDealsTotalCountQueryResponse = {
  dealsTotalCount: number;
} & QueryResponse;

export type CheckSyncedMutationResponse = {
  toCheckSynced: (mutation: { variables: { ids: string[] } }) => Promise<any>;
};

export type ToSyncDealsMutationResponse = {
  toSyncDeals: (mutation: { variables: { dealIds: string[] } }) => Promise<any>;
};

export type CheckSyncedOrdersQueryResponse = {
  posOrders: any[];
} & QueryResponse;

export type CheckSyncedOrdersTotalCountQueryResponse = {
  posOrdersTotalCount: number;
} & QueryResponse;

export type ToSyncOrdersMutationResponse = {
  toSyncOrders: (mutation: {
    variables: { orderIds: string[] };
  }) => Promise<any>;
};
