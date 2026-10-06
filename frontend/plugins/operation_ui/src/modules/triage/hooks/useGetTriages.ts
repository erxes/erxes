import { QueryHookOptions, useQuery } from '@apollo/client';
import { EnumCursorDirection, validateFetchMore } from 'erxes-ui';

import {
  compactList,
  mergeCursorList,
  toCursorPageInfo,
} from '@/operation/utils/cursorList';
import { GET_TRIAGES } from '@/triage/graphql/queries/getTriages';
import type {
  ITriageFilter,
  OperationGetTriageListQuery,
  OperationGetTriageListQueryVariables,
} from '~/gql/graphql';

const TRIAGES_PER_PAGE = 24;

export const useGetTriages = (
  options?: QueryHookOptions<
    OperationGetTriageListQuery,
    OperationGetTriageListQueryVariables
  > & { variables?: ITriageFilter },
) => {
  const { data, loading, fetchMore } = useQuery(GET_TRIAGES, {
    fetchPolicy: 'cache-and-network',
    variables: {
      filter: {
        limit: TRIAGES_PER_PAGE,
        ...options?.variables,
      },
    },
  });

  const triages = compactList(data?.operationGetTriageList?.list);
  const pageInfo = toCursorPageInfo(data?.operationGetTriageList?.pageInfo);
  const totalCount = data?.operationGetTriageList?.totalCount ?? 0;

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
          if (
            !fetchMoreResult.operationGetTriageList ||
            !prev.operationGetTriageList
          ) {
            return prev;
          }

          return {
            ...prev,
            operationGetTriageList: mergeCursorList(
              EnumCursorDirection.FORWARD,
              prev.operationGetTriageList,
              fetchMoreResult.operationGetTriageList,
            ),
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
