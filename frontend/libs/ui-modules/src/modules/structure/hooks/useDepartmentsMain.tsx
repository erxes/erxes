import { OperationVariables, useQuery } from '@apollo/client';
import { GET_DEPARTMENTS } from '../graphql/queries/getDepartments';
import { IDepartment } from '../types/Department';
export const useDepartmentsMain = (options?: OperationVariables) => {
  const { data, loading, fetchMore, error } = useQuery<{
    departmentsMain: {
      list: IDepartment[];
      totalCount?: number;
      totalUsersCount?: number;
    };
  }>(GET_DEPARTMENTS, options);

  const handleFetchMore = () => {
    fetchMore({
      variables: {
        ...options,
      },
    });
  };

  return {
    departments: data?.departmentsMain?.list,
    loading,
    error,
    handleFetchMore,
    totalCount: data?.departmentsMain?.totalCount,
    totalUsersCount: data?.departmentsMain?.totalUsersCount,
  };
};
