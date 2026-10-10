import { IContext } from '~/connectionResolvers';
import {
  getApplicationInfo,
  getCurrentBotUser,
  hasMessageContentIntent,
  hasServerMembersIntent,
  listBotGuilds,
} from '@/integrations/discord/utils/bot';
import {
  getErrorMessage,
  sanitizeToken,
} from '@/integrations/discord/utils/request';
import {
  getGuild,
  listGuildChannels,
} from '@/integrations/discord/utils/channels';
import { debugError } from '@/integrations/discord/debuggers';
import { DISCORD_INBOX_KIND } from '@/integrations/discord/constants';
import { getDiscordStickerAnimation } from '@/integrations/discord/utils/media/stickers';
import { discordChannelQueries } from '@/integrations/discord/graphql/resolvers/queries/channels';

export const discordQueries = {
  ...discordChannelQueries,
  discordStickerAnimation: async (
    _root: unknown,
    { stickerId }: { stickerId: string },
    { checkPermission }: IContext,
  ) => {
    await checkPermission('showConversations');
    return getDiscordStickerAnimation(stickerId);
  },
  discordBots: (_root: undefined, _args: unknown, { models }: IContext) =>
    models.DiscordBots.getBots({}),

  discordBot: (
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => models.DiscordBots.getBot(_id),

  discordBotsTotalCount: (
    _root: undefined,
    _args: unknown,
    { models }: IContext,
  ) => models.DiscordBots.countDocuments({}),

  discordValidateToken: async (
    _root: undefined,
    { token }: { token: string },
  ) => {
    const clean = sanitizeToken(token);

    try {
      const [botUser, appInfo] = await Promise.all([
        getCurrentBotUser(clean),
        getApplicationInfo(clean),
      ]);

      return {
        valid: true,
        botId: botUser?.id,
        botUsername: botUser?.username,
        applicationId: appInfo?.id || botUser?.id,
        hasMessageContentIntent: hasMessageContentIntent(appInfo?.flags),
        hasServerMembersIntent: hasServerMembersIntent(appInfo?.flags),
      };
    } catch (e) {
      return { valid: false, error: (e as Error).message };
    }
  },

  discordGuilds: async (_root: undefined, { token }: { token: string }) => {
    const guilds = await listBotGuilds(sanitizeToken(token));

    return (Array.isArray(guilds) ? guilds : []).map((g) => ({
      id: g.id,
      name: g.name,
      icon: g.icon,
    }));
  },

  discordGuildChannels: async (
    _root: undefined,
    { token, guildId }: { token: string; guildId: string },
  ) => {
    const channels = await listGuildChannels(sanitizeToken(token), guildId);

    return channels.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      parentId: c.parentId,
      parentName: c.parentName,
    }));
  },

  discordServers: async (
    _root: undefined,
    _args: unknown,
    { models }: IContext,
  ) => {
    const bots = await models.DiscordBots.find({
      erxesApiId: { $nin: [null, ''] },
      guildId: { $nin: [null, ''] },
    }).lean();

    const byGuild = new Map<string, typeof bots>();
    for (const bot of bots) {
      const guildId = bot.guildId as string;
      byGuild.set(guildId, [...(byGuild.get(guildId) || []), bot]);
    }

    return Promise.all(
      [...byGuild.entries()].map(async ([guildId, guildBots]) => {
        let name = guildBots.find((bot) => bot.guildName)?.guildName;

        if (!name) {
          try {
            name = (await getGuild(guildBots[0].token, guildId))?.name;
            if (name) {
              await models.DiscordBots.updateMany(
                { guildId, guildName: { $in: [null, ''] } },
                { $set: { guildName: name } },
              );
            }
          } catch (e) {
            debugError(
              `Failed to resolve Discord guild ${guildId}: ${getErrorMessage(
                e,
              )}`,
            );
          }
        }

        return {
          guildId,
          name,
          integrationIds: guildBots
            .map((bot) => bot.erxesApiId)
            .filter(Boolean),
        };
      }),
    );
  },

  discordConnectedServers: async (
    _root: undefined,
    { channelId }: { channelId: string },
    { models }: IContext,
  ) => {
    const bots = await models.DiscordBots.getBotsByInboxChannel(channelId);

    const byGuild = new Map<
      string,
      { guildId: string; guildName?: string; botId: string }
    >();
    for (const bot of bots) {
      if (!bot.guildId || byGuild.has(bot.guildId)) continue;
      byGuild.set(bot.guildId, {
        guildId: bot.guildId,
        guildName: bot.guildName,
        botId: bot._id,
      });
    }

    return [...byGuild.values()];
  },

  discordTakenChannels: async (
    _root: undefined,
    { channelId }: { channelId: string },
    { models }: IContext,
  ) => {
    const bots = await models.DiscordBots.getBotsByInboxChannel(channelId);

    return [...new Set(bots.map((bot) => bot.channelId).filter(Boolean))];
  },

  discordNamePresets: async (
    _root: undefined,
    { channelId }: { channelId: string },
    { models }: IContext,
  ) => {
    if (!channelId) {
      return [];
    }

    const names: string[] = await models.Integrations.find({
      kind: DISCORD_INBOX_KIND,
      channelId,
    }).distinct('name');

    const presets = new Set<string>();
    for (const name of names) {
      const trimmed = (name || '').trim();
      if (!trimmed) {
        continue;
      }

      const separatorIndex = trimmed.indexOf(' - #');
      const prefix = (
        separatorIndex === -1 ? trimmed : trimmed.slice(0, separatorIndex)
      ).trim();

      if (prefix) {
        presets.add(prefix);
      }
    }

    return [...presets].sort((a, b) => a.localeCompare(b));
  },
};
