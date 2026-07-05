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
  discordBots: async (_root: undefined, _args: unknown, { models }: IContext) =>
    models.DiscordBots.getBots({}),

  discordBot: async (
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => models.DiscordBots.getBot(_id),

  discordBotsTotalCount: async (
    _root: undefined,
    _args: unknown,
    { models }: IContext,
  ) => models.DiscordBots.countDocuments({}),

  /**
   * Probes a pasted bot token against Discord so the connect wizard can confirm
   * it, auto-fill the application id / public key, and flag a missing MESSAGE
   * CONTENT intent. Never throws — an invalid token comes back as
   * `{ valid: false, error }` so the UI can show it inline.
   */
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
    }));
  },

  /**
   * Lists the routable channels for an existing bot, keyed by bot id so the
   * automation "Send Discord Message" form can offer a channel dropdown without
   * the client ever handling the bot token (resolved server-side here).
   */
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

  /**
   * Returns the Discord channel an inbox conversation came from (keyed by the
   * core conversation id = `erxesApiId`). Self-heals: if the channel name was
   * never stored (conversation predates the feature, or the resolve failed at
   * ingest), it's fetched from Discord once and persisted.
   */
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

    // The owning bot carries the token used to backfill a missing channel name.
    // Newest-first to match the gateway's routing (`resolveBot`): if duplicate
    // bots exist for a channel, both must agree on which bot owns it.
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
      isThread: !!conversation.isThread,
      parentChannelId: conversation.parentChannelId,
      parentChannelName: conversation.parentChannelName,
    };
  },

  /**
   * Batch variant of `discordConversationChannel`, keyed by core conversation
   * id, so the inbox list can resolve thread/channel metadata for every loaded
   * Discord conversation in a single round-trip (used to nest threads under
   * their parent channel). Returns stored values only — no per-row Discord
   * backfill — to keep the list cheap.
   */
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

    // Map each integration to its bot's (parent) channel id, so thread-ness can
    // be derived for conversations that predate the `isThread` field: a thread
    // routes to its parent's integration but keeps its own channelId, so a
    // channelId that differs from the integration's channel is a thread. Pure
    // Mongo — no Discord REST in the list path.
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

  /**
   * The connected Discord servers (guilds) with the integration ids that belong
   * to each, so the sidebar can group channels under their server. Guild names
   * are stored on the bot at creation (the wizard knows them); bots that predate
   * the field self-heal here: the name is fetched from Discord once and
   * persisted onto every bot of that guild.
   */
  discordServers: async (
    _root: undefined,
    _args: unknown,
    { models }: IContext,
  ) => {
    const bots = await models.DiscordBots.find({
      erxesApiId: { $nin: [null, ''] },
      guildId: { $nin: [null, ''] },
    }).lean();

    // guildId → its bots (each bot = one channel-integration of that server).
    const byGuild = new Map<string, typeof bots>();
    for (const bot of bots) {
      const guildId = bot.guildId as string;
      byGuild.set(guildId, [...(byGuild.get(guildId) || []), bot]);
    }

    return Promise.all(
      [...byGuild.entries()].map(async ([guildId, guildBots]) => {
        let name = guildBots.find((bot) => bot.guildName)?.guildName;

        if (!name) {
          // Self-heal: resolve once via REST (any of the guild's bot tokens can
          // read its own guild) and persist so this never refetches. Best-effort
          // — on failure the sidebar falls back to the raw guild id.
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
              `Failed to resolve Discord guild ${guildId}: ${getErrorMessage(e)}`,
            );
          }
        }

        return {
          guildId,
          name,
          integrationIds: guildBots.map((bot) => bot.erxesApiId).filter(Boolean),
        };
      }),
    );
  },

  /**
   * The Discord users who have chatted in a conversation, so the inbox composer
   * can @-mention them in a reply. Derived from the conversation's message
   * authors mapped to their Discord identity.
   */
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
