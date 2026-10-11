import type {
  AccountingAdjustClosingsQuery,
  AccountingAdjustClosingsQueryVariables,
} from '~/gql/graphql';
import type { QueryHookOptions } from '@apollo/client';
import { toGraphqlView } from '@/utils/graphql';
import { useQuery } from '@apollo/client';
import { ADJUST_CLOSING_QUERY } from '../graphql/adjustClosingQueries';
import { ACC_TRS__PER_PAGE } from '~/modules/transactions/types/constants';
import { EnumCursorDirection } from 'erxes-ui';

export const useAdjustClosing = (
  options?: QueryHookOptions<
    AccountingAdjustClosingsQuery,
    AccountingAdjustClosingsQueryVariables
  >,
) => {
  const {
    data: queryData,
    loading,
    error,
    fetchMore,
  } = useQuery(ADJUST_CLOSING_QUERY, {
    ...options,
    variables: { ...options?.variables, page: 1, perPage: ACC_TRS__PER_PAGE },
  });
  const data = toGraphqlView(queryData);
  const { adjustClosings = [], adjustClosingsCount = 0 } = data || {};

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (
      direction === EnumCursorDirection.FORWARD &&
      adjustClosings.length < adjustClosingsCount
    ) {
      fetchMore({
        variables: {
          page: Math.floor(adjustClosings.length / ACC_TRS__PER_PAGE) + 1,
          perPage: ACC_TRS__PER_PAGE,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;

          return {
            ...prev,
            ...fetchMoreResult,
            adjustClosings: [
              ...(prev.adjustClosings ?? []),
              ...(fetchMoreResult.adjustClosings ?? []),
            ],
          };
        },
      });
    }
  };

  return {
    adjustClosing: adjustClosings,
    totalCount: adjustClosingsCount,
    pageInfo: {
      hasNextPage: adjustClosings.length < adjustClosingsCount,
      hasPreviousPage: false,
    },
    loading,
    error,
    handleFetchMore,
  };
};
