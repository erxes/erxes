import queries from '../graphql/queries';
import { useQuery } from '@apollo/client';
import { IOrder } from '../../types/order';

const POS_PER_PAGE = 30;

export const useOrdersList = (options: { posId?: string } = {}) => {
  const { posId, ...otherOptions } = options;

  const variables: any = {
    perPage: POS_PER_PAGE,
    ...otherOptions,
  };

  if (posId) {
    variables.posId = posId;
  }

  const { data, loading, fetchMore } = useQuery(queries.POS_ORDERS_QUERY, {
    variables,
  });
  const transformedPosOrderList =
    data?.posOrders?.map((order: IOrder) => ({
      ...order,
    })) || [];
  const handleFetchMore = () => {
    if (!data?.posOrders) return;

    fetchMore({
      variables: {
        page: Math.ceil(transformedPosOrderList.length / POS_PER_PAGE) + 1,
        perPage: POS_PER_PAGE,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev;
        }
        return Object.assign({}, prev, {
          posOrders: [...(prev.posOrders || []), ...fetchMoreResult.posOrders],
        });
      },
    });
  };

  return {
    loading,
    ordersList: transformedPosOrderList,
    totalCount: data?.posOrders?.length || 0,
    handleFetchMore,
    pageInfo: {
      hasNextPage:
        transformedPosOrderList.length < (data?.posOrders?.length || 0),
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
  };
};
