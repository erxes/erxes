import { GET_CHANNEL_MEMBERS } from '@/channels/graphql/queries';
import { IChannelMember } from '@/channels/types';
import { useQuery } from '@apollo/client';

interface IGetChannelMembersQueryResponse {
  getChannelMembers: IChannelMember[];
}

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

  const { data, loading, error } = useQuery<IGetChannelMembersQueryResponse>(
    GET_CHANNEL_MEMBERS,
    {
      variables: { channelIds: normalizedIds },
      skip: normalizedIds.length === 0,
    },
  );
  const members = data?.getChannelMembers;
  return { members, loading, error };
};
