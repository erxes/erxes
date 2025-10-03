import { useQuery, QueryHookOptions } from '@apollo/client';

import {
  GET_CHANNELS,
  GET_CHANNELS_BY_MEMBERS,
} from '@/inbox/conversations/graphql/queries/getChannels';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import { IChannel } from '@/inbox/types/Channel';

export const useChannelsByMembers = (
  options?: QueryHookOptions<{ channelsByMembers: IChannel[] }>,
) => {
  const currentUser = useAtomValue(currentUserState);

  const { data, loading } = useQuery<{ channelsByMembers: IChannel[] }>(
    GET_CHANNELS_BY_MEMBERS,
    {
      ...options,
      variables: {
        memberIds: [currentUser?._id],
        ...options?.variables,
      },
    },
  );

  return { channels: data?.channelsByMembers, loading };
};

const CHANNELS_PER_PAGE = 20;

export const useChannels = (
  options?: QueryHookOptions<{
    channels: IChannel[];
    channelsTotalCount: number;
  }>,
) => {
  const { data, loading, fetchMore, error } = useQuery<{
    channels: IChannel[];
    channelsTotalCount: number;
  }>(GET_CHANNELS, {
    ...options,
    variables: {
      page: 1,
      perPage: CHANNELS_PER_PAGE,
      ...options?.variables,
    },
  });

  const { channels, channelsTotalCount } = data || {};

  const handleFetchMore = () => {
    if (!channels?.length || channels.length % CHANNELS_PER_PAGE !== 0) {
      return null;
    }

    fetchMore({
      variables: {
        page: Math.ceil(channels.length / CHANNELS_PER_PAGE) + 1,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev;
        }

        return {
          channels: [...prev.channels, ...fetchMoreResult.channels],
          channelsTotalCount: fetchMoreResult.channelsTotalCount,
        };
      },
    });
  };

  return { channels, loading, handleFetchMore, error, channelsTotalCount };
};
