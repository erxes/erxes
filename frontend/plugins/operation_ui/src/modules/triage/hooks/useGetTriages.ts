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
        filter: {
          limit: TRIAGES_PER_PAGE,
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
          filter: {
            limit: TRIAGES_PER_PAGE,
            ...options?.variables,
            cursor: pageInfo?.endCursor,
          },
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;

          return {
            ...prev,
            operationGetTriageList: mergeCursorData({
              direction: EnumCursorDirection.FORWARD,
              fetchMoreResult: fetchMoreResult.operationGetTriageList,
              prevResult: prev.operationGetTriageList,
            }),
          };
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
