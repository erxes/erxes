import { OperationVariables, QueryHookOptions, useQuery } from '@apollo/client';
import { GET_POSITIONS_QUERY } from '../graphql/queries/getPositions';
import { EnumCursorDirection, ICursorListResponse } from 'erxes-ui';
import { IPosition } from '../types/Position';

const POSITIONS_PER_PAGE = 20;

export const usePositions = (
  options?: QueryHookOptions<ICursorListResponse<IPosition>>,
) => {
  const { data, loading, error, fetchMore } = useQuery<
    ICursorListResponse<IPosition>
  >(GET_POSITIONS_QUERY, { ...options });

  const {
    list: positions,
    totalCount = 0,
    pageInfo,
  } = data?.positionsMain ?? {};

  const handleFetchMore = () => {
    if (totalCount <= (positions?.length || 0)) return;
    fetchMore({
      variables: {
        ...options?.variables,
        cursor: pageInfo?.endCursor,
        limit: POSITIONS_PER_PAGE,
        direction: EnumCursorDirection.FORWARD,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          positionsMain: {
            list: [
              ...(prev.positionsMain?.list || []),
              ...fetchMoreResult.positionsMain.list,
            ],
            totalCount: fetchMoreResult.positionsMain.totalCount,
            pageInfo: fetchMoreResult.positionsMain.pageInfo,
          },
        });
      },
    });
  };

  const positionsWithHasChildren = positions?.map((position) => ({
    ...position,
    hasChildren: positions?.some((p) => p.parentId === position._id),
  }));

  return {
    positions: positionsWithHasChildren,
    sortedPositions: [...(positionsWithHasChildren || [])].sort((a, b) =>
      a.order?.localeCompare(b.order),
    ),
    totalCount,
    pageInfo,
    loading,
    error,
    handleFetchMore,
  };
};
