import { useQuery } from '@apollo/client';
import { POS_ORDERS_BY_CUSTOMER } from '../graphql/queries/queries';

const POS_PER_PAGE = 30;

export const usePosOrderByCustomerList = (options: { posId?: string } = {}) => {
  const { posId, ...otherOptions } = options;

  const variables: any = {
    perPage: POS_PER_PAGE,
    ...otherOptions,
  };

  const { data, loading, fetchMore } = useQuery(POS_ORDERS_BY_CUSTOMER, {
    variables,
  });

  const transformedPosList =
    data?.posOrderCustomers?.map((posOrderCustomers: any) => ({
      ...posOrderCustomers,
    })) || [];

  const handleFetchMore = () => {
    if (!data?.posOrderCustomers) {
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
          posOrderCustomers: [
            ...(prev.posOrderCustomers || []),
            ...fetchMoreResult.posOrderCustomers,
          ],
        });
      },
    });
  };

  return {
    loading,
    posOrderByCustomerList: transformedPosList,
    totalCount: data?.posOrderCustomersTotalCount || 0,
    handleFetchMore,
    pageInfo: {
      hasNextPage:
        transformedPosList.length < (data?.posOrderCustomersTotalCount || 0),
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
  };
};
