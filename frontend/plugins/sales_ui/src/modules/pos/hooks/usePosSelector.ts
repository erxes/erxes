import { hasId } from '@/pos/utils/posJson';
import {
  type QueryHookOptions,
  type TypedDocumentNode,
  useQuery,
} from '@apollo/client';
import type {
  SalesPosOrdersPosListQuery,
  SalesPosOrdersPosListQueryVariables,
} from '~/gql/graphql';

const POS_PER_PAGE = 20;

// The report selectors share a selection shape, but retain distinct operations.
export const usePosSelector = (
  query: TypedDocumentNode<
    SalesPosOrdersPosListQuery,
    SalesPosOrdersPosListQueryVariables
  >,
  options?: QueryHookOptions<
    SalesPosOrdersPosListQuery,
    SalesPosOrdersPosListQueryVariables
  >,
) => {
  const { data, loading, error, fetchMore } = useQuery(query, {
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
      variables: { page: currentPage + 1, perPage: POS_PER_PAGE },
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
