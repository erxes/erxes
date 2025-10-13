import { GET_CHANNEL } from '@/channels/graphql';
import { IChannel } from '@/channels/types';
import { QueryHookOptions, useQuery } from '@apollo/client';

interface IUseGetChannelResponse {
  getChannel: IChannel;
  loading: boolean;
  refetch: any;
}

export const useGetChannel = (
  options?: QueryHookOptions<IUseGetChannelResponse>,
) => {
  const { data, loading, refetch } = useQuery<IUseGetChannelResponse>(
    GET_CHANNEL,
    options,
  );

  const channel = data?.getChannel;

  return { channel, loading, refetch };
};
