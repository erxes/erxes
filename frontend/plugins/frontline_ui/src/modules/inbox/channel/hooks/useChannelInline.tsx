import { QueryHookOptions, useQuery } from '@apollo/client';
import { CHANNEL_DETAIL_QUERY } from '../graphql/queries/ChannelQueries';
import { IChannel } from '@/inbox/types/Channel';

export const useChannelInline = (
  options?: QueryHookOptions<{ getChannel: IChannel }>,
) => {
  const { data, loading, error } = useQuery<{ getChannel: IChannel }>(
    CHANNEL_DETAIL_QUERY,
    options,
  );

  return { channelDetail: data?.getChannel, loading, error };
};
