import { IContext } from '~/connectionResolvers';
import {
  ChannelMemberRoles,
  IChannelsEdit,
} from '~/modules/channel/@types/channel';
import { checkUserRole } from '../../../utils';
import { sendNotification } from 'erxes-api-shared/core-modules';

export const channelMutations = {
  channelAdd: async (
    _parent: undefined,
    {
      name,
      description,
      icon,
      memberIds,
    }: { name: string; description: string; icon: string; memberIds: string[] },
    { models, subdomain, user }: IContext,
  ) => {
    if (!user?._id) throw new Error('Unauthorized');
    const userId = user._id;
    memberIds = memberIds || [];
    memberIds = memberIds.includes(userId)
      ? memberIds.filter((id) => id !== userId)
      : [...memberIds];

    const channel = await models.Channels.createChannel({
      channelDoc: { name, description, icon },
      memberIds,
      adminId: userId,
    });

    sendNotification(subdomain, {
      title: 'Assigned on Channel',
      message: `You assigned on ${channel.name} channel`,
      type: 'info',
      fromUserId: user._id,
      userIds: memberIds || [],
      contentType: 'frontline:inbox.channel',
      contentTypeId: (channel?._id as string) || '',
      action: 'resolved',
      priority: 'medium',
      notificationType: 'channelMembersChange',
    });

    return channel;
  },

  channelUpdate: async (
    _parent: undefined,
    { _id, ...doc }: IChannelsEdit,
    { models, subdomain, user }: IContext,
  ) => {
    if (!user.isOwner) {
      await checkUserRole({
        models,
        channelId: _id,
        userId: user?._id,
        allowedRoles: [ChannelMemberRoles.ADMIN],
      });
    }
    await models.Channels.updateChannel(_id, doc, user._id);

    return await models.Channels.getChannel(_id);
  },

  channelRemove: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models, user }: IContext,
  ) => {
    if (!user.isOwner) {
      await checkUserRole({
        models,
        channelId: _id,
        userId: user._id,
        allowedRoles: [ChannelMemberRoles.ADMIN],
      });
    }

    return models.Channels.removeChannel(_id);
  },

  channelAddMembers: async (
    _parent: undefined,
    { _id, memberIds }: { _id: string; memberIds: string[] },
    { models, user }: IContext,
  ) => {
    if (!user.isOwner) {
      await checkUserRole({
        models,
        channelId: _id,
        userId: user._id,
        allowedRoles: [ChannelMemberRoles.ADMIN, ChannelMemberRoles.LEAD],
      });
    }

    return models.ChannelMembers.createChannelMembers(
      memberIds.map((memberId) => ({
        memberId,
        channelId: _id,
        role: ChannelMemberRoles.MEMBER,
      })),
    );
  },

  channelRemoveMember: async (
    _parent: undefined,
    { channelId, memberId }: { channelId: string; memberId: string },
    { models, user }: IContext,
  ) => {
    if (!user.isOwner) {
      await checkUserRole({
        models,
        channelId,
        userId: user._id,
        allowedRoles: [ChannelMemberRoles.ADMIN],
      });
    }

    return models.ChannelMembers.removeChannelMember(channelId, memberId);
  },

  channelUpdateMember: async (
    _parent: undefined,
    { _id, role }: { _id: string; memberId: string; role: ChannelMemberRoles },
    { models, user }: IContext,
  ) => {
    const channelMember = await models.ChannelMembers.findOne({ _id });

    if (!channelMember) {
      throw new Error('Channels member not found');
    }
    if (!user.isOwner) {
      await checkUserRole({
        models,
        channelId: channelMember.channelId,
        userId: user._id,
        allowedRoles: [ChannelMemberRoles.ADMIN],
      });
    }

    return models.ChannelMembers.updateChannelMember(_id, role, user._id);
  },
};
