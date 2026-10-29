import {
  requireDiscordLinkUser,
  startDiscordAccountLink,
} from '@/discordIntegration/utils/discordAccountLink';
import { IContext } from '~/connectionResolvers';
import { createNotifications } from '~/utils/notifications';

export const discordAccountMutations = {
  async operationDiscordStartAccountLink(
    _parent: undefined,
    _args: undefined,
    { models, subdomain, user }: IContext,
  ) {
    const userId = requireDiscordLinkUser(user);

    return startDiscordAccountLink({ models, subdomain, userId });
  },

  async operationDiscordUnlinkMyAccount(
    _parent: undefined,
    _args: undefined,
    { models, subdomain, user }: IContext,
  ) {
    const userId = requireDiscordLinkUser(user);

    await models.DiscordUserLink.deleteOne({ userId, subdomain });

    return { success: true };
  },

  async operationDiscordUnlinkMember(
    _parent: undefined,
    { userId }: { userId: string },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('teamUpdate');

    await models.DiscordUserLink.deleteOne({ userId, subdomain });

    return { success: true };
  },

  async operationDiscordRemindMember(
    _parent: undefined,
    { teamId, userId }: { teamId: string; userId: string },
    { models, subdomain, user, checkPermission }: IContext,
  ) {
    await checkPermission('teamUpdate');

    const fromUserId = requireDiscordLinkUser(user);

    const [isMember, isLinked, linkingEnabled] = await Promise.all([
      models.TeamMember.exists({ teamId, memberId: userId }),
      models.DiscordUserLink.exists({ userId, subdomain }),
      models.DiscordConnection.exists({ subdomain, hasClientSecret: true }),
    ]);

    if (!isMember) {
      throw new Error('This user is not a member of the team');
    }

    if (isLinked) {
      throw new Error('This member has already linked a Discord account');
    }

    if (!linkingEnabled) {
      throw new Error('Discord account linking is not set up yet');
    }

    await createNotifications({
      contentType: 'discord',
      contentTypeId: teamId,
      fromUserId,
      subdomain,
      notificationType: 'discordAccountLink',
      userIds: [userId],
      action: 'requested',
      models,
      event: 'operation:discord:accountLinkRequest',
    });

    return { success: true };
  },
};
