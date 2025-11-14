import { useQuery } from '@apollo/client';
import queries from '@/pos/pos-order-by-subsription/graphql/queries';

const POS_PER_PAGE = 30;

export const usePosOrderBySubscriptionList = (
  options: { posId?: string } = {},
) => {
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
    queries.POS_ORDER_BY_SUBSCRIPTION,
    {
      variables,
    },
  );

  const transformedPosList =
    data?.PosOrderBySubscriptions?.map((PosOrderBySubscriptions: any) => ({
      ...PosOrderBySubscriptions,
    })) || [];

  const handleFetchMore = () => {
    if (!data?.PosOrderBySubscriptions) {
      return;
    }

    fetchMore({
      variables: {
        ...variables,
        page: Math.ceil(transformedPosList.length / POS_PER_PAGE) + 1,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev;
        }
        return Object.assign({}, prev, {
          PosOrderBySubscriptions: [
            ...(prev.PosOrderBySubscriptions || []),
            ...fetchMoreResult.PosOrderBySubscriptions,
          ],
        });
      },
    });
  };

  return {
    loading,
    posOrderBySubscriptionList: transformedPosList,
    totalCount: data?.PosOrderBySubscriptionsTotalCount || 0,
    handleFetchMore,
    pageInfo: {
      hasNextPage:
        transformedPosList.length <
        (data?.PosOrderBySubscriptionsTotalCount || 0),
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
  };
};
