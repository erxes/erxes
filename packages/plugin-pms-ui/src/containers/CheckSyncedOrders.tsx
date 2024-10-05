import Alert from '@erxes/ui/src/utils/Alert';
import CheckSyncedOrders from '../components/syncedOrders/CheckSyncedOrders';
import { gql } from '@apollo/client';
import React, { useState } from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { Bulk } from '@erxes/ui/src/components';
import {
  CheckSyncedMutationResponse,
  CheckSyncedOrdersQueryResponse,
  CheckSyncedOrdersTotalCountQueryResponse,
  PosListQueryResponse,
  ToSyncOrdersMutationResponse,
} from '../types';
import { mutations, queries } from '../graphql';
import { router } from '@erxes/ui/src/utils/core';
import { useQuery, useMutation } from '@apollo/client';

type Props = {
  queryParams: any;
};

const CheckSyncedOrdersContainer = (props: Props) => {
  const { queryParams } = props;
  const posListQuery = useQuery<PosListQueryResponse>(
    gql(`query posList {
    posList {
      _id
      name
      description
    }
  }`),
  );

  const checkSyncItemsQuery = useQuery<CheckSyncedOrdersQueryResponse>(
    gql(queries.checkSyncOrders),
    {
      variables: generateParams({ queryParams }),
      fetchPolicy: 'network-only',
    },
  );

  const checkSyncedOrdersTotalCountQuery =
    useQuery<CheckSyncedOrdersTotalCountQueryResponse>(
      gql(queries.checkSyncOrdersTotalCount),
      {
        variables: generateParams({ queryParams }),
        fetchPolicy: 'network-only',
      },
    );

  const [toMultiCheckSynced] = useMutation<CheckSyncedMutationResponse>(
    gql(mutations.toCheckSynced),
  );
  const [toMultiSyncOrders] = useMutation<ToSyncOrdersMutationResponse>(
    gql(mutations.toSyncOrders),
  );

  const [unSyncedOrderIds, setUnSyncedOrderIds] = useState([] as string[]);
  const [syncedOrderInfos, setSyncedOrderInfos] = useState({} as any);

  // remove action
  const checkSynced = async ({ orderIds }, emptyBulk) => {
    await toMultiCheckSynced({
      variables: { ids: orderIds, type: 'pos' },
    })
      .then((response) => {
        emptyBulk();
        const syncedOrderInfos: any[] = [];
        const items: any[] = response?.data?.toMultiCheckSynced || ([] as any);

        const unSyncedOrderIds: string[] = items
          .filter((item) => {
            const brands = item.mustBrands || [];
            for (const b of brands) {
              if (!item[b]) {
                return true;
              }
            }
            return false;
          })
          .map((i) => i._id);

        items.forEach((item) => {
          syncedOrderInfos[item._id] = item;
        });
        setUnSyncedOrderIds(unSyncedOrderIds);
        setSyncedOrderInfos(syncedOrderInfos);
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const toSyncOrders = (orderIds) => {
    toMultiSyncOrders({
      variables: { orderIds },
    })
      .then((response) => {
        const { skipped, error, success } = response?.data?.toMultiSyncOrders as any;
        const changed = unSyncedOrderIds.filter((u) => !orderIds.includes(u));
        setUnSyncedOrderIds(changed);
        Alert.success(
          `Алгассан: ${skipped.length}, Алдаа гарсан: ${error.length}, Амжилттай: ${success.length}`,
        );
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  if (
    checkSyncItemsQuery.loading ||
    checkSyncedOrdersTotalCountQuery.loading ||
    posListQuery.loading
  ) {
    return <Spinner />;
  }
  const orders = checkSyncItemsQuery?.data?.posOrders || [];
  const totalCount =
    checkSyncedOrdersTotalCountQuery?.data?.posOrdersTotalCount || 0;

  const updatedProps = {
    ...props,
    loading: checkSyncItemsQuery.loading,
    orders,
    totalCount,
    checkSynced,
    unSyncedOrderIds: unSyncedOrderIds,
    syncedOrderInfos: syncedOrderInfos,
    toSyncOrders,
    posList: posListQuery?.data?.posList,
  };

  const content = (props) => <CheckSyncedOrders {...props} {...updatedProps} />;

  return <Bulk content={content} />;
};

const generateParams = ({ queryParams }) => {
  const pageInfo = router.generatePaginationParams(queryParams || {});

  return {
    paidStartDate: queryParams.paidStartDate,
    paidEndDate: queryParams.paidEndDate,
    createdStartDate: queryParams.createdStartDate,
    createdEndDate: queryParams.createdEndDate,
    posToken: queryParams.posToken,
    userId: queryParams.user,
    posId: queryParams.pos,
    search: queryParams.search,
    sortField: queryParams.sortField,
    sortDirection: Number(queryParams.sortDirection) || undefined,
    page: queryParams.page ? parseInt(queryParams.page, 10) : 1,
    perPage: queryParams.perPage ? parseInt(queryParams.perPage, 10) : 20,
  };
};

export default CheckSyncedOrdersContainer;
