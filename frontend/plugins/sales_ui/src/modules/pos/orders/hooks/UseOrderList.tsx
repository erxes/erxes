import { useQuery } from '@apollo/client';
import { queries } from '~/modules/pos/graphql';

import { IOrder } from '~/modules/pos/types/order';

const POS_PER_PAGE = 30;

export const useOrdersList = (options = {}) => {
  const { data, loading, fetchMore } = useQuery(queries.posList, {
    variables: {
      perPage: POS_PER_PAGE,
      ...options,
    },
  });

  const transformedPosList =
    data?.posList?.map((order: IOrder) => ({
      _id: order._id,
      name: order.name,
      isOnline: order.isOnline || false,
      onServer: order.onServer || false,
      branchTitle: order.branchTitle || '',
      departmentTitle: order.departmentTitle || '',
      createdAt: order.createdAt,
      createdBy: order?.user?.details?.fullName || 'Admin',
    })) || [];

  const handleFetchMore = () => {
    if (!data?.ordersList) {
      return;
    }

    fetchMore({
      variables: {
        page: Math.ceil(transformedPosList.length / POS_PER_PAGE) + 1,
        perPage: POS_PER_PAGE,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev;
        }
        return Object.assign({}, prev, {
          ordersList: [
            ...(prev.ordersList || []),
            ...fetchMoreResult.ordersList,
          ],
        });
      },
    });
  };

  return {
    loading,
    ordersList: transformedPosList,
    totalCount: data?.ordersList?.length || 0,
    handleFetchMore,
    pageInfo: {
      hasNextPage: transformedPosList.length < (data?.ordersList?.length || 0),
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
  };
};
