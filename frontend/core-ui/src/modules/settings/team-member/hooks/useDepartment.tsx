import { OperationVariables, useQuery } from '@apollo/client';
import { queries } from '@/settings/team-member/graphql';

export type TDepartment = {
  _id: string;
  title: string;
  parentId: string;
};

const useDepartment = (options?: OperationVariables) => {
  const { data, loading } = useQuery(queries.GET_DEPARTMENTS_QUERY, {
    ...options,
    onError(error) {
      console.error(error.message);
    },
  });

  const { departments } = data || [];

  return { departments, loading };
};

export { useDepartment };
