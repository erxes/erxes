import { IChannelMemberDocument } from '@/channel/@types/channel';

export const ChannelMember = {
  member(channelMember: IChannelMemberDocument) {
    return (
      channelMember.memberId && {
        __typename: 'User',
        _id: channelMember.memberId,
      }
    );
  },
};
