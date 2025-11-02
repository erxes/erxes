import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  ICursorListResponse,
  mergeCursorData,
  validateFetchMore,
} from 'erxes-ui';

import { GET_TRIAGES } from '@/triage/graphql/queries/getTriages';
import { ITriage } from '@/triage/types/triage';

const TRIAGES_PER_PAGE = 24;

export const useGetTriages = (
  options?: QueryHookOptions<ICursorListResponse<ITriage>>,
) => {
  const { data, loading, fetchMore } = useQuery<ICursorListResponse<ITriage>>(
    GET_TRIAGES,
    {
      fetchPolicy: 'cache-and-network',
      variables: {
        limit: TRIAGES_PER_PAGE,
        filter: {
          ...options?.variables,
        },
      },
    },
  );

  const {
    list: triages = [],
    pageInfo,
    totalCount = 0,
  } = data?.operationGetTriageList || {};

  const handleFetchMore = () => {
    if (
      validateFetchMore({ direction: EnumCursorDirection.FORWARD, pageInfo })
    ) {
      fetchMore({
        variables: {
          cursor: pageInfo?.endCursor,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return Object.assign({}, prev, {
            triages: mergeCursorData({
              direction: EnumCursorDirection.FORWARD,
              fetchMoreResult: fetchMoreResult.triages,
              prevResult: prev.triages,
            }),
          });
        },
      });
    }
  };

  return {
    triages,
    pageInfo,
    totalCount,
    loading,
    handleFetchMore,
  };
};
