import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_POLL_DETAIL } from '@/poll/graphql/pollQueries';
import { IPoll } from '@/poll/types/pollTypes';

export const usePollDetail = (options?: QueryHookOptions) => {
  const { data, loading, error } = useQuery(GET_POLL_DETAIL, {
    fetchPolicy: 'cache-and-network',
    ...options,
  });

  return {
    poll: data?.pollDetail as IPoll | undefined,
    loading,
    error,
  };
};
