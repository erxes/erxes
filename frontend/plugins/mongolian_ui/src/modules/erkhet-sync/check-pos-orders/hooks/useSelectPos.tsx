import { useQuery, QueryHookOptions } from '@apollo/client';
import { compactList } from '@/shared/utils/cursorList';
import type {
  MongolianPosListQuery,
  MongolianPosListQueryVariables,
} from '~/gql/graphql';
import { toPos } from '../types/pos';
import { GET_POS_LIST } from '@/shared/graphql/posList';

const POS_PER_PAGE = 20;

export const usePos = (
  options?: QueryHookOptions<
    MongolianPosListQuery,
    MongolianPosListQueryVariables
  >,
) => {
  const { data, loading, error, fetchMore } = useQuery(GET_POS_LIST, {
    ...options,
    variables: {
      perPage: POS_PER_PAGE,
      page: 1,
      ...options?.variables,
    },
  });

  const posList = compactList(data?.posList).flatMap(toPos);

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
