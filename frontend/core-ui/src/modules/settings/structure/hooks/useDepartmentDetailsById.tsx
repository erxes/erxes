import { OperationVariables, useQuery } from '@apollo/client';
import { GET_DEPARTMENT_DETAIL_BY_ID } from '../graphql';

const useDepartmentDetailsById = (options: OperationVariables) => {
  const { data, loading } = useQuery(GET_DEPARTMENT_DETAIL_BY_ID, {
    skip: !options.variables?.id,
    ...options,
  });
  const { departmentDetail } = data || {};
  return { departmentDetail, loading };
};

export { useDepartmentDetailsById };
