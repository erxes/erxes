import { useQuery } from '@apollo/client';
import queries from '@/pos/pos-items/graphql/queries';
import { IPosItem } from '@/pos/pos-items/types/posItem';

const POS_PER_PAGE = 30;

export const usePosItemsList = (options: { posId?: string } = {}) => {
  const { posId, ...otherOptions } = options;

  const variables: any = {
    perPage: POS_PER_PAGE,
    ...otherOptions,
  };

  if (posId) {
    variables.posId = posId;
  }

  const { data, loading, fetchMore } = useQuery(
    queries.POS_ORDER_RECORDS_QUERY,
    {
      variables,
    },
  );

  const transformedPosList =
    data?.posOrderRecords?.map((posItem: IPosItem) => ({
      ...posItem,
    })) || [];

  const handleFetchMore = () => {
    if (!data?.posOrderRecords) {
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
          posOrderRecords: [
            ...(prev.posOrderRecords || []),
            ...fetchMoreResult.posOrderRecords,
          ],
        });
      },
    });
  };

  return {
    loading,
    posItemList: transformedPosList,
    totalCount: data?.posOrderRecords?.totalCount || 0,
    handleFetchMore,
    pageInfo: {
      hasNextPage:
        transformedPosList.length < (data?.posOrderRecords?.totalCount || 0),
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
  };
};
