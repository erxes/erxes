import { IContext } from '~/connectionResolvers';
import {
  ChannelMemberRoles,
  ChannelScopes,
  IChannelDocument,
  IChannelsEdit,
} from '@/channel/@types/channel';
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
      scope,
    }: {
      name: string;
      description: string;
      icon: string;
      memberIds: string[];
      scope?: string;
    },
    { models, subdomain, user }: IContext,
  ) => {
    if (!user?._id) throw new Error('Unauthorized');
    const userId = user._id;

    if (scope && !Object.values(ChannelScopes).includes(scope as ChannelScopes)) {
      throw new Error(
        `Unknown channel scope "${scope}". Use "team" or "personal".`,
      );
    }

    const channelScope = (scope as ChannelScopes) || ChannelScopes.TEAM;
    const isPersonal = channelScope === ChannelScopes.PERSONAL;

    memberIds = memberIds || [];
    memberIds = memberIds.includes(userId)
      ? memberIds.filter((id) => id !== userId)
      : [...memberIds];

    // A personal channel is the creator's private inbox: exactly one member and
    // no invite path, so it cannot be opened with members already attached.
    if (isPersonal && memberIds.length) {
      throw new Error(
        'A personal channel cannot have other members. Create a team channel to share this inbox.',
      );
    }

    let channel: IChannelDocument;

    try {
      channel = await models.Channels.createChannel({
        channelDoc: { name, description, icon, scope: channelScope },
        memberIds,
        adminId: userId,
      });
    } catch (e) {
      // The partial unique index on personal channels rejected a second one.
      if (isPersonal && e.code === 11000) {
        throw new Error('You already have a personal channel.');
      }
      throw e;
    }

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

    const channel = await models.Channels.findOne({ _id });

    if (!channel) {
      throw new Error('Channel not found');
    }

    // A personal channel is one person's private inbox. Keeping it at exactly
    // one member is what lets the membership-based conversation filters scope
    // it correctly without a dedicated branch.
    if (channel.scope === ChannelScopes.PERSONAL) {
      throw new Error(
        'A personal channel cannot have other members. Create a team channel to share this inbox.',
      );
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
  channelRemoveMembers: async (
    _parent: undefined,
    { channelId, memberIds }: { channelId: string; memberIds: string[] },
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

    return models.ChannelMembers.removeChannelMembers(channelId, memberIds);
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
