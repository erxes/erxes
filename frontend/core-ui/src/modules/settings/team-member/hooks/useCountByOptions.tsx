import { OperationVariables, useQuery } from '@apollo/client';
import { queries } from '@/settings/team-member/graphql';

const useCountByOptions = (options?: OperationVariables) => {
  const { data, loading } = useQuery(queries.GET_USER_COUNT_BY_OPTION_QUERY, {
    ...options,
    onError(error) {
      console.error(error.message);
    },
  });
  const { usersTotalCount } = data || 0;
  return { usersTotalCount, loading };
};
export { useCountByOptions };
