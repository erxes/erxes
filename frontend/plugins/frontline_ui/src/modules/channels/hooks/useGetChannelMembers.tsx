import { GET_CHANNEL_MEMBERS } from '@/channels/graphql/queries';
import { compactList } from '@/shared/utils/cursorList';
import { useQuery } from '@apollo/client';
import { useMemo } from 'react';

export const useGetChannelMembers = ({
  channelIds,
}: {
  channelIds?: string[] | string;
}) => {
  const normalizedIds = Array.isArray(channelIds)
    ? channelIds
    : channelIds
    ? [channelIds]
    : [];

  const { data, loading, error } = useQuery(GET_CHANNEL_MEMBERS, {
    variables: { channelIds: normalizedIds },
    skip: normalizedIds.length === 0,
  });
  const members = useMemo(
    () =>
      data?.getChannelMembers ? compactList(data.getChannelMembers) : undefined,
    [data?.getChannelMembers],
  );
  return { members, loading, error };
};
