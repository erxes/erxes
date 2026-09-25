import { canGroup } from 'erxes-api-shared/core-modules';
import { FilterQuery } from 'mongoose';
import { ChannelScopes, IChannelDocument } from '@/channel/@types/channel';
import { IContext, IModels } from '~/connectionResolvers';

// Personal channels are private to their owner, so a see-everything view must
// still stop at someone else's. Legacy channels have no `scope` and `$ne`
// matches a missing field, so they stay visible.
export const excludeOthersPersonalChannels = (userId?: string) => ({
  $or: [{ scope: { $ne: ChannelScopes.PERSONAL } }, { createdBy: userId }],
});

// Team channels only — personal inboxes are reached through
// `getPersonalChannel`, never through a channel listing. Legacy channels saved
// before `scope` existed have no field and take the schema default of `team`.
export const teamChannelsOnly = () => ({
  $or: [{ scope: ChannelScopes.TEAM }, { scope: { $exists: false } }],
});

/**
 * The channels a request may read: every channel for a see-everything user
 * (minus other people's personal inboxes), otherwise the caller's memberships.
 */
export const visibleChannelsFilter = async ({
  models,
  subdomain,
  user,
}: {
  models: IModels;
  subdomain: string;
  user: IContext['user'];
}): Promise<FilterQuery<IChannelDocument>> => {
  if (user?.isOwner || (await canGroup(subdomain, 'showAllChannels', user))) {
    return excludeOthersPersonalChannels(user?._id);
  }

  const channelIds = await models.ChannelMembers.find({
    memberId: user?._id,
  }).distinct('channelId');

  return { _id: { $in: channelIds } };
};

export const checkUserRole = async ({
  models,
  channelId,
  userId,
  allowedRoles,
  channelIds,
}: {
  models: IModels;
  channelId?: string;
  userId: string;
  allowedRoles: string[];
  channelIds?: string[];
}) => {
  if (channelIds && channelIds.length > 0) {
    const userRoles = await models.ChannelMembers.find({
      channelId: { $in: channelIds },
      memberId: userId,
    });

    if (!userRoles || userRoles.length === 0) {
      throw new Error('User not in channel 1');
    }

    let isAllowed = false;

    userRoles.forEach((userRole) => {
      if (allowedRoles.includes(userRole.role)) {
        isAllowed = true;
      }
    });

    if (!isAllowed) {
      throw new Error('User is not allowed to perform this action');
    }

    return;
  }
  const userRole = await models.ChannelMembers.findOne({
    channelId,
    memberId: userId,
  });

  if (!userRole) {
    throw new Error('User not in channel 2');
  }

  if (!allowedRoles.includes(userRole.role)) {
    throw new Error('User is not allowed to perform this action');
  }

  return;
};
