import { OperationVariables, useQuery } from '@apollo/client';
import { GET_DEPARTMENTS_LIST } from '../graphql';
import { useMultiQueryState } from 'erxes-ui';
import { IDepartmentListItem } from '../types/department';

export const useDepartmentsList = (options?: OperationVariables) => {
  const [{ searchValue, parentId }] = useMultiQueryState<{
    searchValue: string;
    parentId: string;
  }>(['searchValue', 'parentId']);
  const { data, error, loading } = useQuery(GET_DEPARTMENTS_LIST, {
    variables: {
      ...options?.variables,
      searchValue,
      parentId,
    },
    ...options,
  });

  const departments = data?.departmentsMain?.list || [];

  const departmentsWithHasChildren = departments?.map(
    (dep: IDepartmentListItem) => ({
      ...dep,
      hasChildren: departments?.some(
        (d: IDepartmentListItem) => d.parentId === dep._id,
      ),
    }),
  );
  return {
    departments: departmentsWithHasChildren,
    sortedDepartments: [...(departmentsWithHasChildren || [])].sort((a, b) =>
      a.order?.localeCompare(b.order),
    ),
    totalCount: data ? data?.departmentsMain?.totalCount : 0,
    loading,
    error,
  };
};
