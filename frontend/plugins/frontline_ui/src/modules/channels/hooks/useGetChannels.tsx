import { useQuery, QueryHookOptions } from '@apollo/client';
import { IChannel } from '@/channels/types';
import { GET_CHANNELS } from '@/channels/graphql';

interface IGetChannelsQueryResponse {
  getChannels: IChannel[];
}

export const useGetChannels = (
  options?: QueryHookOptions<IGetChannelsQueryResponse>,
) => {
  const { data, loading } = useQuery<IGetChannelsQueryResponse>(
    GET_CHANNELS,
    options,
  );

  const channels = data?.getChannels;

  return { channels, loading };
};
