import { hasId } from '@/pos/utils/posJson';
import { QueryHookOptions, useQuery } from '@apollo/client';
import { gql } from '~/gql';
import type {
  SalesPosSummaryPosListQuery,
  SalesPosSummaryPosListQueryVariables,
  SalesPosSummarySelectDetailQuery,
  SalesPosSummarySelectDetailQueryVariables,
} from '~/gql/graphql';
import { POS_QUERY } from '../graphql/queries/posQuery';

const POS_PER_PAGE = 20;

export const usePos = (
  options?: QueryHookOptions<
    SalesPosSummaryPosListQuery,
    SalesPosSummaryPosListQueryVariables
  >,
) => {
  const { data, loading, error, fetchMore } = useQuery(POS_QUERY, {
    ...options,
    variables: {
      perPage: POS_PER_PAGE,
      page: 1,
      ...options?.variables,
    },
  });

  const posList = (data?.posList ?? []).filter(hasId);

  const handleFetchMore = () => {
    const currentPage = Math.floor(posList.length / POS_PER_PAGE) + 1;

    fetchMore({
      variables: {
        page: currentPage + 1,
        perPage: POS_PER_PAGE,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          posList: [
            ...(prev.posList ?? []),
            ...(fetchMoreResult.posList ?? []),
          ],
        };
      },
    });
  };

  return {
    posList,
    loading,
    error,
    handleFetchMore,
    totalCount: posList.length,
  };
};
export const usePosByIds = (
  options: QueryHookOptions<
    SalesPosSummarySelectDetailQuery,
    SalesPosSummarySelectDetailQueryVariables
  >,
) => {
  const { data, loading, error } = useQuery(
    gql(`
      query salesPosSummarySelectDetail($_id: String!) {
        posDetail(_id: $_id) {
          _id
          name
          description
          token
          user {
            _id
            details {
              fullName
              avatar
            }
          }
          branchTitle
          departmentTitle
          isOnline
          onServer
        }
      }
    `),
    {
      ...options,
    },
  );

  const { posDetail } = data || {};

  return {
    posDetail: hasId(posDetail) ? posDetail : undefined,
    loading,
    error,
  };
};
