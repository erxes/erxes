import { OperationVariables, useQuery } from '@apollo/client';
import { GET_POSITIONS_LIST } from '../graphql';
import { useMultiQueryState } from 'erxes-ui';
import { IPositionListItem } from '../types/position';

export const usePositionsList = (options?: OperationVariables) => {
  const [{ searchValue, parentId }] = useMultiQueryState<{
    searchValue: string;
    parentId: string;
  }>(['searchValue', 'parentId']);
  const { data, loading, error } = useQuery(GET_POSITIONS_LIST, {
    variables: {
      ...options?.variables,
      parentId: parentId ?? undefined,
      searchValue,
    },
    ...options,
  });

  const positions = data?.positionsMain?.list || [];
  const positionsWithHasChildren = positions?.map(
    (position: IPositionListItem) => ({
      ...position,
      hasChildren: positions?.some(
        (b: IPositionListItem) => b.parentId === position._id,
      ),
    }),
  );
  return {
    positions: positionsWithHasChildren,
    sortedPositions: [...(positionsWithHasChildren || [])].sort((a, b) =>
      (a.order ?? '').localeCompare(b.order ?? ''),
    ),
    totalCount: data ? data.positionsMain.totalCount : 0,
    loading,
    error,
  };
};
