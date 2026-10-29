import { IDiscordUserLink } from '@/discordIntegration/@types/discordUserLink';
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

    const [linkingEnabled, link] = await Promise.all([
      models.DiscordConnection.exists({ subdomain, hasClientSecret: true }),
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

    const [members, config] = await Promise.all([
      models.TeamMember.find({ teamId }).lean(),
      models.DiscordConfig.findByTeam(teamId, subdomain),
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

    const connection = config
      ? await models.DiscordConnection.findOne({
          _id: config.connectionId,
          subdomain,
        })
          .select('+token')
          .lean()
      : null;

    const inServer =
      connection && connection.health?.status !== 'broken'
        ? await checkServerMembership({
            models,
            token: connection.token,
            guildId: connection.guildId,
            links,
          })
        : new Map<string, boolean | null>();

    const linkByUser = new Map(links.map((link) => [link.userId, link]));

    return userIds.map((userId) => {
      const link = linkByUser.get(userId) ?? null;

      return {
        userId,
        link,
        inServer: link ? inServer.get(link.discordUserId) ?? null : null,
      };
    });
  },
};
