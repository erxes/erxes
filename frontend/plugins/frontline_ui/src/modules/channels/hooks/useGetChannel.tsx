import { GET_CHANNEL } from '@/channels/graphql';
import { QueryHookOptions, useQuery } from '@apollo/client';
import type { GetChannelQuery, GetChannelQueryVariables } from '~/gql/graphql';

export const useGetChannel = (
  options?: QueryHookOptions<GetChannelQuery, GetChannelQueryVariables>,
) => {
  const { data, loading, refetch } = useQuery(GET_CHANNEL, options);

  const channel = data?.getChannel ?? undefined;

  return { channel, loading, refetch };
};
