import { useQuery, QueryHookOptions } from '@apollo/client';
import { useMemo } from 'react';
import { GET_CHANNELS } from '@/channels/graphql';
import { compactList } from '@/shared/utils/cursorList';
import type {
  FrontlineChannelListQuery,
  FrontlineChannelListQueryVariables,
} from '~/gql/graphql';

export const useGetChannels = (
  options?: QueryHookOptions<
    FrontlineChannelListQuery,
    FrontlineChannelListQueryVariables
  >,
) => {
  const { data, loading, error, refetch } = useQuery(GET_CHANNELS, {
    fetchPolicy: 'cache-and-network',
    ...options,
  });

  const channels = useMemo(
    () => (data?.getChannels ? compactList(data.getChannels) : undefined),
    [data?.getChannels],
  );

  return { channels, loading, error, refetch };
};
