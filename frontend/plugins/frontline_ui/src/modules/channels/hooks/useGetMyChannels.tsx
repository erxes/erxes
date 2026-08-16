import { useQuery, QueryHookOptions } from '@apollo/client';
import { IChannel } from '@/channels/types';
import { GET_MY_CHANNELS } from '@/channels/graphql';

interface IGetMyChannelsQueryResponse {
  getMyChannels: IChannel[];
}

/**
 * Every consumer asks for the same order so they render consistently and share
 * one Apollo cache entry. The API collates names case-insensitively, so this is
 * the order the sidebar used to produce with `localeCompare`.
 */
const MY_CHANNELS_ORDER = { sortField: 'name', sortDirection: 1 };

export const useGetMyChannels = (
  options?: QueryHookOptions<IGetMyChannelsQueryResponse>,
) => {
  const { data, loading, refetch } = useQuery<IGetMyChannelsQueryResponse>(
    GET_MY_CHANNELS,
    {
      fetchPolicy: 'cache-and-network',
      ...options,
      variables: { ...MY_CHANNELS_ORDER, ...options?.variables },
    },
  );

  const channels = data?.getMyChannels;

  return { channels, loading, refetch };
};
