import { GET_PERSONAL_CHANNEL } from '@/channels/graphql';
import { QueryHookOptions, useQuery } from '@apollo/client';
import type {
  GetPersonalChannelQuery,
  GetPersonalChannelQueryVariables,
} from '~/gql/graphql';

/*
 * The personal channel is provisioned lazily: the API creates it the first time
 * this query runs for a user, so simply opening the personal channel settings
 * page is what brings the channel into existence.
 */
export const useGetPersonalChannel = (
  options?: QueryHookOptions<
    GetPersonalChannelQuery,
    GetPersonalChannelQueryVariables
  >,
) => {
  const { data, loading, error, refetch } = useQuery(GET_PERSONAL_CHANNEL, {
    fetchPolicy: 'cache-and-network',
    ...options,
  });

  return {
    channel: data?.getPersonalChannel ?? undefined,
    loading,
    error,
    refetch,
  };
};
