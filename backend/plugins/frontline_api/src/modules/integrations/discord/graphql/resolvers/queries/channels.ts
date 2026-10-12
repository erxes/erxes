import { IContext } from '~/connectionResolvers';
import {
  getChannel,
  listGuildChannels,
  normalizeMemberQuery,
} from '@/integrations/discord/utils/channels';
import { debugError } from '@/integrations/discord/debuggers';
import { getChannelMemberViewers } from '@/integrations/discord/channelAccess';

export const discordChannelQueries = {
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
  discordChannelMembers: async (
    _root: undefined,
    { conversationId, query }: { conversationId: string; query: string },
    { models }: IContext,
  ) => {
    const unavailable = {
      members: [],
      status: 'ERROR' as const,
      truncated: false,
    };

    if (!normalizeMemberQuery(query)) {
      return { members: [], status: 'OK' as const, truncated: false };
    }

    const conversation = await models.DiscordConversations.findOne({
      erxesApiId: conversationId,
    });

    if (!conversation?.channelId || !conversation.guildId) {
      return unavailable;
    }

    const bot = await models.DiscordBots.findOne({
      erxesApiId: conversation.integrationId,
    }).sort({ createdAt: -1 });

    if (!bot?.token) {
      return unavailable;
    }

    const { viewers, status, truncated } = await getChannelMemberViewers(
      bot.token,
      conversation.channelId,
      conversation.guildId,
      query,
    );

    return { members: viewers, status, truncated };
  },
};
