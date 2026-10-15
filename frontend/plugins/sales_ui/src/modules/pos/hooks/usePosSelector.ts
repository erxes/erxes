import { hasId } from '@/pos/utils/posJson';
import { getNextPosSelectorPage } from '@/pos/utils/posSelectorPage';
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
  const variables = {
    perPage: POS_PER_PAGE,
    page: 1,
    ...options?.variables,
  };
  const { data, loading, error, fetchMore } = useQuery(query, {
    ...options,
    variables,
  });
  const loadedPosList = data?.posList ?? [];
  const posList = loadedPosList.filter(hasId);

  const handleFetchMore = () => {
    fetchMore({
      variables: getNextPosSelectorPage(
        variables,
        loadedPosList.length,
        POS_PER_PAGE,
      ),
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
