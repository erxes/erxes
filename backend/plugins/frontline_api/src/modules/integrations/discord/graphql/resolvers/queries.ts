import { IContext } from '~/connectionResolvers';
import {
  getApplicationInfo,
  getChannel,
  getCurrentBotUser,
  getErrorMessage,
  getGuild,
  hasMessageContentIntent,
  listBotGuilds,
  listGuildChannels,
  sanitizeToken,
} from '@/integrations/discord/utils';
import { debugError } from '@/integrations/discord/debuggers';

export const discordQueries = {
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

  discordBotChannels: async (
    _root: undefined,
    { botId }: { botId: string },
    { models }: IContext,
  ) => {
    const bot = await models.DiscordBots.findById(botId);

    if (!bot?.token || !bot?.guildId) {
      return [];
    }

    try {
      const channels = await listGuildChannels(bot.token, bot.guildId);
      return channels.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        parentId: c.parentId,
        parentName: c.parentName,
      }));
    } catch (e) {
      debugError(
        `Failed to list channels for Discord bot ${botId}: ${
          (e as Error).message
        }`,
      );
      return [];
    }
  },

  discordConversationChannel: async (
    _root: undefined,
    { conversationId }: { conversationId: string },
    { models }: IContext,
  ) => {
    const conversation = await models.DiscordConversations.findOne({
      erxesApiId: conversationId,
    });

    if (!conversation) {
      return null;
    }

    let { channelName } = conversation;

    const bot = await models.DiscordBots.findOne({
      erxesApiId: conversation.integrationId,
    }).sort({ createdAt: -1 });

    if (!channelName && conversation.channelId && bot?.token) {
      try {
        channelName =
          (await getChannel(bot.token, conversation.channelId))?.name ??
          undefined;

        if (channelName) {
          conversation.channelName = channelName;
          await conversation.save();
        }
      } catch (e) {
        debugError(
          `Failed to backfill Discord channel name for conversation ${conversationId}: ${
            (e as Error).message
          }`,
        );
      }
    }

    return {
      conversationId,
      channelId: conversation.channelId,
      channelName,
      guildId: conversation.guildId,
      isThread: Boolean(conversation.isThread),
      parentChannelId: conversation.parentChannelId,
      parentChannelName: conversation.parentChannelName,
    };
  },

  discordConversationChannels: async (
    _root: undefined,
    { conversationIds }: { conversationIds: string[] },
    { models }: IContext,
  ) => {
    if (!conversationIds?.length) {
      return [];
    }

    const conversations = await models.DiscordConversations.find({
      erxesApiId: { $in: conversationIds },
    }).lean();

    const integrationIds = [
      ...new Set(conversations.map((c) => c.integrationId).filter(Boolean)),
    ];
    const bots = await models.DiscordBots.find({
      erxesApiId: { $in: integrationIds },
    }).lean();
    const parentChannelByIntegration = new Map(
      bots.map((bot) => [bot.erxesApiId, bot.channelId]),
    );

    return conversations.map((conversation) => {
      const parentChannelId = parentChannelByIntegration.get(
        conversation.integrationId,
      );
      const isThread =
        typeof conversation.isThread === 'boolean'
          ? conversation.isThread
          : Boolean(
              parentChannelId && conversation.channelId !== parentChannelId,
            );

      return {
        conversationId: conversation.erxesApiId,
        channelId: conversation.channelId,
        channelName: conversation.channelName,
        guildId: conversation.guildId,
        isThread,
        parentChannelId: conversation.parentChannelId ?? parentChannelId,
        parentChannelName: conversation.parentChannelName,
      };
    });
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

  discordConversationParticipants: async (
    _root: undefined,
    { conversationId }: { conversationId: string },
    { models }: IContext,
  ) => {
    const conversation = await models.DiscordConversations.findOne({
      erxesApiId: conversationId,
    });

    if (!conversation) {
      return [];
    }

    const customerIds = await models.DiscordConversationMessages.distinct(
      'customerId',
      { conversationId: conversation._id, customerId: { $nin: [null, ''] } },
    );

    if (!customerIds.length) {
      return [];
    }

    const customers = await models.DiscordCustomers.find({
      erxesApiId: { $in: customerIds },
    }).lean();

    return customers
      .filter((customer) => customer.userId)
      .map((customer) => ({
        customerId: customer.erxesApiId,
        userId: customer.userId,
        name:
          [customer.firstName, customer.lastName].filter(Boolean).join(' ') ||
          'Discord user',
        avatar: customer.profilePic,
      }));
  },
};
