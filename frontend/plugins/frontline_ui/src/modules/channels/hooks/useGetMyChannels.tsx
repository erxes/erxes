import { useQuery, QueryHookOptions } from '@apollo/client';
import { IChannel } from '@/channels/types';
import { GET_MY_CHANNELS } from '@/channels/graphql';

interface IGetMyChannelsQueryResponse {
  getMyChannels: IChannel[];
}

export const useGetMyChannels = (
  options?: QueryHookOptions<IGetMyChannelsQueryResponse>,
) => {
  const { data, loading } = useQuery<IGetMyChannelsQueryResponse>(
    GET_MY_CHANNELS,
    {
      fetchPolicy: 'cache-and-network',
      ...options,
    },
  );

  const channels = data?.getMyChannels;

  return { channels, loading };
};
