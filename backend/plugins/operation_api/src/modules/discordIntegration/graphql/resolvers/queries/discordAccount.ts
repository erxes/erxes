import { IDiscordUserLink } from '@/discordIntegration/@types/discordUserLink';
import { DISCORD_MEMBER_LINKING_ON } from '@/discordIntegration/constants';
import {
  getDiscordOAuthRedirectUri,
  requireDiscordLinkUser,
} from '@/discordIntegration/utils/discordAccountLink';
import { IContext, IModels } from '~/connectionResolvers';
import {
  getDiscordAvatarUrl,
  getDiscordGuildMember,
} from '~/utils/discordClient';

type TLinkWithId = IDiscordUserLink & { _id: unknown };

const combineMembership = (
  memberships: Map<string, boolean | null>[],
  discordUserId: string,
) => {
  const values = memberships.map(
    (membership) => membership.get(discordUserId) ?? null,
  );

  if (values.includes(false)) {
    return false;
  }

  return values.length && values.every(Boolean) ? true : null;
};

const checkServerMembership = async ({
  models,
  token,
  guildId,
  links,
}: {
  models: IModels;
  token: string;
  guildId: string;
  links: TLinkWithId[];
}) => {
  const inServer = new Map<string, boolean | null>();

  await Promise.all(
    links.map(async (link) => {
      try {
        const member = await getDiscordGuildMember(
          token,
          guildId,
          link.discordUserId,
        );

        inServer.set(link.discordUserId, Boolean(member));

        if (!member?.user) {
          return;
        }

        const username = member.user.username;
        const globalName = member.user.global_name ?? null;
        const avatarUrl = getDiscordAvatarUrl(member.user);

        if (
          username !== link.username ||
          globalName !== (link.globalName ?? null) ||
          avatarUrl !== (link.avatarUrl ?? null)
        ) {
          await models.DiscordUserLink.updateOne(
            { _id: link._id },
            { $set: { username, globalName, avatarUrl } },
          );
          Object.assign(link, { username, globalName, avatarUrl });
        }
      } catch {
        inServer.set(link.discordUserId, null);
      }
    }),
  );

  return inServer;
};

export const discordAccountQueries = {
  async operationDiscordMyAccount(
    _parent: undefined,
    _args: undefined,
    { models, subdomain, user }: IContext,
  ) {
    const userId = requireDiscordLinkUser(user);

    await models.DiscordConnection.dropUnreadableClientSecrets(subdomain);

    const [linkingEnabled, link] = await Promise.all([
      models.DiscordConnection.exists({
        subdomain,
        ...DISCORD_MEMBER_LINKING_ON,
      }),
      models.DiscordUserLink.findOne({ userId, subdomain }).lean(),
    ]);

    return { linkingEnabled: Boolean(linkingEnabled), link };
  },

  async operationDiscordOAuthRedirectUri(
    _parent: undefined,
    _args: undefined,
    { subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('teamUpdate');

    return getDiscordOAuthRedirectUri(subdomain);
  },

  async operationDiscordTeamMembers(
    _parent: undefined,
    { teamId }: { teamId: string },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('teamRead');

    const [members, configs] = await Promise.all([
      models.TeamMember.find({ teamId }).lean(),
      models.DiscordConfig.listByTeam(teamId, subdomain),
    ]);

    const userIds = [
      ...new Set(
        members
          .map((member) => member.memberId)
          .filter((memberId): memberId is string => Boolean(memberId)),
      ),
    ];

    const links: TLinkWithId[] = await models.DiscordUserLink.find({
      subdomain,
      userId: { $in: userIds },
    }).lean();

    const connectionIds = [
      ...new Set(configs.map((config) => config.connectionId)),
    ];

    const connections = await Promise.all(
      connectionIds.map((_id) =>
        models.DiscordConnection.findWithToken({ _id, subdomain }),
      ),
    );

    const memberships = await Promise.all(
      connections
        .flatMap((connection) =>
          connection && connection.health?.status !== 'broken'
            ? [connection]
            : [],
        )
        .map((connection) =>
          checkServerMembership({
            models,
            token: connection.token,
            guildId: connection.guildId,
            links,
          }),
        ),
    );

    const linkByUser = new Map(links.map((link) => [link.userId, link]));

    return userIds.map((userId) => {
      const link = linkByUser.get(userId) ?? null;

      return {
        userId,
        link,
        inServer: link
          ? combineMembership(memberships, link.discordUserId)
          : null,
      };
    });
  },
};
