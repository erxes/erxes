import { GET_PERSONAL_CHANNEL } from '@/channels/graphql';
import { IChannel } from '@/channels/types';
import { QueryHookOptions, useQuery } from '@apollo/client';

interface IGetPersonalChannelQueryResponse {
  getPersonalChannel: IChannel;
}

/*
 * The personal channel is provisioned lazily: the API creates it the first time
 * this query runs for a user, so simply opening the personal channel settings
 * page is what brings the channel into existence.
 */
export const useGetPersonalChannel = (
  options?: QueryHookOptions<IGetPersonalChannelQueryResponse>,
) => {
  const { data, loading, error, refetch } =
    useQuery<IGetPersonalChannelQueryResponse>(GET_PERSONAL_CHANNEL, {
      fetchPolicy: 'cache-and-network',
      ...options,
    });

  return { channel: data?.getPersonalChannel, loading, error, refetch };
};
