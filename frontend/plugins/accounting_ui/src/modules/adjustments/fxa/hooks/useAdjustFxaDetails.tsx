import type {
  AccountingAdjustFxaDetailsQuery,
  AccountingAdjustFxaDetailsQueryVariables,
} from '~/gql/graphql';
import type { QueryHookOptions } from '@apollo/client';
import { toGraphqlView } from '@/utils/graphql';
import { useQuery } from '@apollo/client';
import { ACC_TRS__PER_PAGE } from '@/transactions/types/constants';
import { ADJUST_FXA_DETAILS_QUERY } from '../graphql/adjustFixedAssetQueries';

export const useAdjustFxaDetails = (
  options?: QueryHookOptions<
    AccountingAdjustFxaDetailsQuery,
    AccountingAdjustFxaDetailsQueryVariables
  >,
) => {
  const {
    data: queryData,
    loading,
    error,
    fetchMore,
  } = useQuery(ADJUST_FXA_DETAILS_QUERY, {
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

  const adjustFxaDetails = data?.adjustFxaDetails || [];
  const adjustFxaDetailsCount = data?.adjustFxaDetailsCount || 0;

  const handleFetchMore = () => {
    if (adjustFxaDetails.length >= adjustFxaDetailsCount) {
      return;
    }

    fetchMore({
      variables: {
        perPage: ACC_TRS__PER_PAGE,
        page: Math.ceil(adjustFxaDetails.length / ACC_TRS__PER_PAGE) + 1,
      },
      updateQuery: (prev, { fetchMoreResult }) => ({
        ...prev,
        ...fetchMoreResult,
        adjustFxaDetails: [
          ...(prev.adjustFxaDetails ?? []),
          ...(fetchMoreResult.adjustFxaDetails ?? []),
        ],
      }),
    });
  };

  return {
    adjustFxaDetails,
    adjustFxaDetailsCount,
    loading,
    error,
    handleFetchMore,
  };
};
