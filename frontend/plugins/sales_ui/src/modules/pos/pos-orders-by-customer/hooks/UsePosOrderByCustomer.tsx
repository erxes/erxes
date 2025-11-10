import { useQuery } from '@apollo/client';
import queries from '@/pos/pos-orders-by-customer/graphql/queries';

const POS_PER_PAGE = 30;

export const usePosOrderByCustomerList = (options: { posId?: string } = {}) => {
  const { posId, ...otherOptions } = options;

  const variables: any = {
    perPage: POS_PER_PAGE,
    ...otherOptions,
    posId,
  };

  if (posId) {
    variables.posId = posId;
  }

  const { data, loading, fetchMore } = useQuery(
    queries.POS_ORDERS_BY_CUSTOMER,
    {
      variables,
    },
  );

  const transformedPosList =
    data?.PosOrderCustomers?.map((PosOrderCustomers: any) => ({
      ...PosOrderCustomers,
    })) || [];

  const handleFetchMore = () => {
    if (!data?.PosOrderCustomers) {
      return;
    }

    fetchMore({
      variables: {
        ...variables,
        page: Math.ceil(transformedPosList.length / POS_PER_PAGE) + 1,
        perPage: POS_PER_PAGE,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev;
        }
        return Object.assign({}, prev, {
          PosOrderCustomers: [
            ...(prev.PosOrderCustomers || []),
            ...fetchMoreResult.PosOrderCustomers,
          ],
        });
      },
    });
  };

  return {
    loading,
    posOrderByCustomerList: transformedPosList,
    totalCount: data?.PosOrderCustomersTotalCount || 0,
    handleFetchMore,
    pageInfo: {
      hasNextPage:
        transformedPosList.length < (data?.PosOrderCustomersTotalCount || 0),
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
  };
};
