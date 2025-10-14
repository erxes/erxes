import { IModels } from '~/connectionResolvers';

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
