import { QueryHookOptions, useQuery } from '@apollo/client';
import { EnumCursorDirection, ICursorListResponse } from 'erxes-ui';
import { IUnit } from '../types/Unit';
import { GET_UNITS_MAIN } from '../graphql/queries/getUnits';

const UNITS_PER_PAGE = 20;

export const useUnits = (
  options?: QueryHookOptions<ICursorListResponse<IUnit>>,
) => {
  const { data, loading, error, fetchMore } = useQuery<
    ICursorListResponse<IUnit>
  >(GET_UNITS_MAIN, { ...options });

  const { list: units, totalCount = 0, pageInfo } = data?.unitsMain ?? {};

  const handleFetchMore = () => {
    if (totalCount <= (units?.length || 0)) return;
    fetchMore({
      variables: {
        ...options?.variables,
        cursor: pageInfo?.endCursor,
        limit: UNITS_PER_PAGE,
        direction: EnumCursorDirection.FORWARD,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          unitsMain: {
            list: [
              ...(prev.unitsMain?.list || []),
              ...fetchMoreResult.unitsMain.list,
            ],
            totalCount: fetchMoreResult.unitsMain.totalCount,
            pageInfo: fetchMoreResult.unitsMain.pageInfo,
          },
        });
      },
    });
  };

  return {
    units,
    totalCount,
    pageInfo,
    loading,
    error,
    handleFetchMore,
  };
};
