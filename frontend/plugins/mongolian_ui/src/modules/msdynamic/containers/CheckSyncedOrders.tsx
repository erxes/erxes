import React, { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';

import CheckSyncedOrders from '../components/syncedOrders/CheckSyncedOrders';
import { queries, mutations } from '../graphql';

type Props = {
  queryParams: any;
};

const generateParams = (queryParams: any) => ({
  paidStartDate: queryParams.paidStartDate,
  paidEndDate: queryParams.paidEndDate,
  createdStartDate: queryParams.createdStartDate,
  createdEndDate: queryParams.createdEndDate,
  userId: queryParams.user,
  brandId: queryParams.brandId,
  search: queryParams.search,
  sortField: queryParams.sortField,
  sortDirection: Number(queryParams.sortDirection) || undefined,
  page: queryParams.page ? parseInt(queryParams.page, 10) : 1,
  perPage: queryParams.perPage ? parseInt(queryParams.perPage, 10) : 20,
});

const POS_LIST_QUERY = gql(`
  query posList {
    posList {
      _id
      name
      description
    }
  }
`);

const CheckSyncedOrdersContainer = ({ queryParams }: Props) => {
  const [unSyncedOrderIds, setUnSyncedOrderIds] = useState<string[]>([]);
  const [syncedOrderInfos, setSyncedOrderInfos] = useState<any>({});

  const variables = generateParams(queryParams);

  // queries
  const {
    data: ordersData,
    loading: ordersLoading,
    refetch,
  } = useQuery(gql(queries.checkSyncOrders), {
    variables,
    fetchPolicy: 'network-only',
  });

  const { data: totalData } = useQuery(gql(queries.checkSyncOrdersTotalCount), {
    variables,
    fetchPolicy: 'network-only',
  });

  const { data: posListData } = useQuery(POS_LIST_QUERY);

  // mutations
  const [toCheckMsdSynced] = useMutation(gql(mutations.toCheckMsdSynced));

  const [toSendMsdOrdersMutation] = useMutation(gql(mutations.toSendMsdOrders));

  const checkSynced = async (
    { orderIds }: { orderIds: string[] },
    emptyBulk: () => void,
  ) => {
    try {
      const response = await toCheckMsdSynced({
        variables: {
          ids: orderIds,
          brandId: queryParams.brandId,
        },
      });

      emptyBulk();

      const statuses = response.data.toCheckMsdSynced || [];

      const unSynced = statuses
        .filter((s: any) => !s.isSynced)
        .map((s: any) => s._id);

      const syncedInfos: any = {};

      statuses
        .filter((s: any) => s.isSynced)
        .forEach((item: any) => {
          syncedInfos[item._id] = {
            syncedBillNumber: item.syncedBillNumber || '',
            syncedDate: item.syncedDate || '',
            syncedCustomer: item.syncedCustomer || '',
          };
        });

      setUnSyncedOrderIds(unSynced);
      setSyncedOrderInfos(syncedInfos);

      console.log('Check finished');
    } catch (e: any) {
      console.error(e.message);
    }
  };

  const toSendMsdOrders = async (orderIds: string[]) => {
    try {
      const response = await toSendMsdOrdersMutation({
        variables: { orderIds },
      });

      const { _id, syncedBillNumber, syncedDate, syncedCustomer } =
        response.data.toSendMsdOrders;

      setSyncedOrderInfos({
        [_id]: {
          syncedBillNumber: syncedBillNumber || '',
          syncedDate: syncedDate || '',
          syncedCustomer: syncedCustomer || '',
        },
      });

      console.log('Successful');
    } catch (e: any) {
      console.error(e.message);
    }
  };

  const orders = ordersData?.posOrders || [];
  const totalCount = totalData?.posOrdersTotalCount || 0;

  return (
    <CheckSyncedOrders
      queryParams={queryParams}
      loading={ordersLoading}
      orders={orders}
      totalCount={totalCount}
      checkSynced={checkSynced}
      unSyncedOrderIds={unSyncedOrderIds}
      syncedOrderInfos={syncedOrderInfos}
      toSendMsdOrders={toSendMsdOrders}
      posList={posListData?.posList || []}
    />
  );
};

export default CheckSyncedOrdersContainer;
