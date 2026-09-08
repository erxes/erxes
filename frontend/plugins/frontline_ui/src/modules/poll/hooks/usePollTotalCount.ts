import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_POLL_TOTAL_COUNT } from '@/poll/graphql/pollQueries';

export const usePollTotalCount = (options?: QueryHookOptions) => {
  const { data, loading } = useQuery(GET_POLL_TOTAL_COUNT, {
    fetchPolicy: 'cache-and-network',
    ...options,
  });

  return {
    totalCount: data?.pollTotalCount?.total as number | undefined,
    byStatus: data?.pollTotalCount?.byStatus as
      | Record<string, number>
      | undefined,
    loading,
  };
};
