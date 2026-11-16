import { toGraphqlView } from '@/utils/graphql';
import { mergeGraphqlCursorData } from '@/utils/graphqlCursor';
import { useQuery } from '@apollo/client';
import { EnumCursorDirection, useMultiQueryState } from 'erxes-ui';
import { ADJUST_DEBT_RATE_QUERY } from '../graphql/adjustDebtRateQueries';

type TAdjustDebtRatesVariables = {
  limit?: number;
  cursor?: string | null;
  orderBy?: Record<string, 1 | -1>;
  searchValue?: string;
};

type TAdjustDebtRateFilters = {
  searchValue: string;
  branchId: string;
  departmentId: string;
};

export const ADJUST_DEBT_RATE_FILTER_KEYS: (keyof TAdjustDebtRateFilters)[] = [
  'searchValue',
  'branchId',
  'departmentId',
];

export const useAdjustDebtRates = (variables?: TAdjustDebtRatesVariables) => {
  const [filters] = useMultiQueryState<TAdjustDebtRateFilters>(
    ADJUST_DEBT_RATE_FILTER_KEYS,
  );
  const {
    data: queryData,
    loading,
    error,
    refetch,
    fetchMore,
  } = useQuery(ADJUST_DEBT_RATE_QUERY, {
    variables: {
      limit: 20,
      cursor: null,
      orderBy: { createdAt: -1 },
      searchValue: filters.searchValue || undefined,
      branchId: filters.branchId || undefined,
      departmentId: filters.departmentId || undefined,
      ...variables,
    },
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });
  const data = toGraphqlView(queryData);
  const pageInfo = data?.adjustDebtRates?.pageInfo;

  const handleFetchMore = () => {
    if (loading || !pageInfo?.hasNextPage || !pageInfo.endCursor) return;

    fetchMore({
      variables: { cursor: pageInfo.endCursor },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.adjustDebtRates) return prev;
        return {
          ...prev,
          adjustDebtRates: mergeGraphqlCursorData({
            direction: EnumCursorDirection.FORWARD,
            fetchMoreResult: fetchMoreResult.adjustDebtRates,
            prevResult: prev.adjustDebtRates,
          }),
        };
      },
    });
  };

  return {
    adjustDebtRates: data?.adjustDebtRates?.list || [],
    totalCount: data?.adjustDebtRates?.totalCount || 0,
    pageInfo,
    loading,
    error,
    refetch,
    handleFetchMore,
  };
};
