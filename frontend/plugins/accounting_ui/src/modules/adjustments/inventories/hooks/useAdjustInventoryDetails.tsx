import type {
  AccountingAdjustInventoryDetailsQuery,
  AccountingAdjustInventoryDetailsQueryVariables,
} from '~/gql/graphql';
import type { QueryHookOptions } from '@apollo/client';
import { toGraphqlView } from '@/utils/graphql';
import { useQuery } from '@apollo/client';
import { ADJUST_INVENTORY_DETAILS_QUERY } from '../graphql/adjustInventoryQueries';

import { ACC_TRS__PER_PAGE } from '@/transactions/types/constants';

export const useAdjustInventoryDetails = (
  options?: QueryHookOptions<
    AccountingAdjustInventoryDetailsQuery,
    AccountingAdjustInventoryDetailsQueryVariables
  >,
) => {
  const {
    data: queryData,
    loading,
    error,
    fetchMore,
  } = useQuery(ADJUST_INVENTORY_DETAILS_QUERY, {
    ...options,
    skip: !options?.variables?._id,
    variables: {
      _id: options?.variables?._id ?? '',
      ...options?.variables,
      page: 1,
      perPage: ACC_TRS__PER_PAGE,
    },
  });
  const data = toGraphqlView(queryData);
  const { adjustInventoryDetails = [], adjustInventoryDetailsCount = 0 } =
    data || {};

  const handleFetchMore = () => {
    if (adjustInventoryDetails?.length < adjustInventoryDetailsCount) {
      fetchMore({
        variables: {
          perPage: ACC_TRS__PER_PAGE,
          page:
            Math.ceil(adjustInventoryDetails?.length / ACC_TRS__PER_PAGE) + 1,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          return {
            ...prev,
            ...fetchMoreResult,
            adjustInventoryDetails: [
              ...(prev.adjustInventoryDetails ?? []),
              ...(fetchMoreResult.adjustInventoryDetails ?? []),
            ],
          };
        },
      });
    }
  };

  return {
    adjustInventoryDetails,
    adjustInventoryDetailsCount,
    handleFetchMore,
    loading,
    error,
  };
};
