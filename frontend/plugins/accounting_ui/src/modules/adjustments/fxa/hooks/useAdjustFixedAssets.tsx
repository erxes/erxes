import type {
  AccountingAdjustFixedAssetsQuery,
  AccountingAdjustFixedAssetsQueryVariables,
} from '~/gql/graphql';
import type { QueryHookOptions } from '@apollo/client';
import { toGraphqlView } from '@/utils/graphql';
import { useQuery } from '@apollo/client';
import { ACC_TRS__PER_PAGE } from '@/transactions/types/constants';
import { ADJUST_FIXED_ASSETS_QUERY } from '../graphql/adjustFixedAssetQueries';

export const useAdjustFixedAssets = (
  options?: QueryHookOptions<
    AccountingAdjustFixedAssetsQuery,
    AccountingAdjustFixedAssetsQueryVariables
  >,
) => {
  const {
    data: queryData,
    loading,
    error,
    fetchMore,
  } = useQuery(ADJUST_FIXED_ASSETS_QUERY, {
    ...options,
    variables: {
      ...options?.variables,
      page: 1,
      perPage: ACC_TRS__PER_PAGE,
    },
  });
  const data = toGraphqlView(queryData);

  const adjustFixedAssets = data?.adjustFixedAssets || [];
  const totalCount = data?.adjustFixedAssetsCount || 0;

  const handleFetchMore = () => {
    if (adjustFixedAssets.length >= totalCount) {
      return;
    }

    fetchMore({
      variables: {
        perPage: ACC_TRS__PER_PAGE,
        page: Math.ceil(adjustFixedAssets.length / ACC_TRS__PER_PAGE) + 1,
      },
      updateQuery: (prev, { fetchMoreResult }) => ({
        ...prev,
        ...fetchMoreResult,
        adjustFixedAssets: [
          ...(prev.adjustFixedAssets ?? []),
          ...(fetchMoreResult.adjustFixedAssets ?? []),
        ],
      }),
    });
  };

  return {
    adjustFixedAssets,
    totalCount,
    loading,
    error,
    handleFetchMore,
  };
};
