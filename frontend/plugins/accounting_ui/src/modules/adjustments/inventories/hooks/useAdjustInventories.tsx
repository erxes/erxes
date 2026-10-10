import type {
  AccountingAdjustInventoriesQuery,
  AccountingAdjustInventoriesQueryVariables,
} from '~/gql/graphql';
import type { QueryHookOptions } from '@apollo/client';
import { toGraphqlView } from '@/utils/graphql';
import { ADJUST_INVENTORIES_QUERY } from '../graphql/adjustInventoryQueries';
import { useQuery } from '@apollo/client';
import { ACC_TRS__PER_PAGE } from '../../../transactions/types/constants';

export const useAdjustInventories = (
  options?: QueryHookOptions<
    AccountingAdjustInventoriesQuery,
    AccountingAdjustInventoriesQueryVariables
  >,
) => {
  const {
    data: queryData,
    loading,
    error,
    fetchMore,
  } = useQuery(ADJUST_INVENTORIES_QUERY, {
    ...options,
    variables: {
      ...options?.variables,
      page: 1,
      perPage: ACC_TRS__PER_PAGE,
    },
  });
  const data = toGraphqlView(queryData);
  const { adjustInventories = [], adjustInventoriesCount = 0 } = data || {};

  const handleFetchMore = () => {
    if (adjustInventories?.length < adjustInventoriesCount) {
      fetchMore({
        variables: {
          perPage: ACC_TRS__PER_PAGE,
          page: Math.ceil(adjustInventories?.length / ACC_TRS__PER_PAGE) + 1,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          return {
            ...prev,
            ...fetchMoreResult,
            adjustInventories: [
              ...(prev.adjustInventories ?? []),
              ...(fetchMoreResult.adjustInventories ?? []),
            ],
          };
        },
      });
    }
  };

  return {
    adjustInventories,
    totalCount: adjustInventoriesCount,
    loading,
    error,
    handleFetchMore,
  };
};
