import { QueryHookOptions, useQuery } from '@apollo/client';
import { EnumCursorDirection, ICursorListResponse } from 'erxes-ui';
import { IDepartment } from '../types/Department';
import { GET_DEPARTMENTS } from '../graphql/queries/getDepartments';

const DEPARTMENTS_PER_PAGE = 20;

export const useDepartments = (
  options?: QueryHookOptions<ICursorListResponse<IDepartment>>,
) => {
  const { data, loading, error, fetchMore } = useQuery<
    ICursorListResponse<IDepartment>
  >(GET_DEPARTMENTS, { ...options });

  const {
    list: departments,
    totalCount = 0,
    pageInfo,
  } = data?.departmentsMain ?? {};

  const handleFetchMore = () => {
    if (totalCount <= (departments?.length || 0)) return;
    fetchMore({
      variables: {
        ...options?.variables,
        cursor: pageInfo?.endCursor,
        limit: DEPARTMENTS_PER_PAGE,
        direction: EnumCursorDirection.FORWARD,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          departmentsMain: {
            list: [
              ...(prev.departmentsMain?.list || []),
              ...fetchMoreResult.departmentsMain.list,
            ],
            totalCount: fetchMoreResult.departmentsMain.totalCount,
            pageInfo: fetchMoreResult.departmentsMain.pageInfo,
          },
        });
      },
    });
  };

  const departmentsWithHasChildren = departments?.map((department) => ({
    ...department,
    hasChildren: departments?.some((d) => d.parentId === department._id),
  }));

  return {
    departments: departmentsWithHasChildren,
    sortedDepartments: [...(departmentsWithHasChildren || [])].sort((a, b) =>
      (a.order ?? '').localeCompare(b.order ?? ''),
    ),
    totalCount,
    pageInfo,
    loading,
    error,
    handleFetchMore,
  };
};
