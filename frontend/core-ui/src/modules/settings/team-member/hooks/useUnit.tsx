import { OperationVariables, useQuery } from '@apollo/client';
import { queries } from '@/settings/team-member/graphql';

export type TUnit = {
  _id: string;
  title: string;
};

const useUnit = (options?: OperationVariables) => {
  const { data, loading } = useQuery(queries.GET_UNITS_QUERY, {
    ...options,
    onError(error) {
      console.error(error.message);
    },
  });
  const { units } = data || [];
  return { units, loading };
};
export { useUnit };
