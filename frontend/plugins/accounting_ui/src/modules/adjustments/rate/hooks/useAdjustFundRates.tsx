import { toGraphqlView } from '@/utils/graphql';
import { mergeGraphqlCursorData } from '@/utils/graphqlCursor';
import { useAdjustRateFetchMore } from '@/adjustments/hooks/useAdjustRateFetchMore';
import { useQuery } from '@apollo/client';
import { EnumCursorDirection, useQueryState } from 'erxes-ui';
import { ADJUST_FUND_RATE_QUERY } from '../graphql/adjustFundRateQueries';

type TAdjustFundRatesVariables = {
  limit?: number;
  cursor?: string | null;
  orderBy?: Record<string, 1 | -1>;
  searchValue?: string;
};

export const useAdjustFundRates = (variables?: TAdjustFundRatesVariables) => {
  const [searchValue] = useQueryState<string>('searchValue');
  const {
    data: queryData,
    loading,
    error,
    refetch,
    fetchMore,
  } = useQuery(ADJUST_FUND_RATE_QUERY, {
    variables: {
      limit: 20,
      cursor: null,
      orderBy: { createdAt: -1 },
      searchValue: searchValue || undefined,
      ...variables,
    },
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });
  const data = toGraphqlView(queryData);
  const pageInfo = data?.adjustFundRates?.pageInfo;

  const { handleFetchMore, retryFetchMore, fetchMoreError } =
    useAdjustRateFetchMore({
      loading,
      hasNextPage: pageInfo?.hasNextPage,
      endCursor: pageInfo?.endCursor,
      fetchNext: (cursor) =>
        fetchMore({
          variables: { cursor },
          updateQuery: (
            prev,
            { fetchMoreResult, variables: pageVariables },
          ) => {
            if (
              !fetchMoreResult?.adjustFundRates ||
              prev.adjustFundRates?.pageInfo?.endCursor !==
                pageVariables?.cursor
            ) {
              return prev;
            }
            return {
              ...prev,
              adjustFundRates: mergeGraphqlCursorData({
                direction: EnumCursorDirection.FORWARD,
                fetchMoreResult: fetchMoreResult.adjustFundRates,
                prevResult: prev.adjustFundRates,
              }),
            };
          },
        }),
    });

  return {
    adjustFundRates: data?.adjustFundRates?.list || [],
    totalCount: data?.adjustFundRates?.totalCount || 0,
    pageInfo,
    loading,
    error,
    refetch,
    handleFetchMore,
    retryFetchMore,
    fetchMoreError,
  };
};
