import { useQuery } from '@apollo/client';
import { GET_DEPARTMENT_BY_ID } from '../graphql/queries/getDepartments';
import { IDepartment } from '../types/Department';
import { OperationVariables } from '@apollo/client';

export const useDepartmentById = (options?: OperationVariables) => {
  const { data, loading } = useQuery<{ departmentDetail: IDepartment }>(
    GET_DEPARTMENT_BY_ID,
    options,
  );
  return { departmentDetail: data?.departmentDetail, loading };
};
