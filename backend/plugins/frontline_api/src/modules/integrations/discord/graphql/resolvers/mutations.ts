import { IContext, IModels } from '~/connectionResolvers';
import {
  IDiscordBot,
  IDiscordBotEditInput,
} from '@/integrations/discord/@types/bot';
import {
  DiscordApiError,
  deleteChannelMessage,
  editChannelMessage,
} from '@/integrations/discord/utils';

const resolveChannelContext = async (
  models: IModels,
  conversationId: string,
) => {
  if (!conversationId) {
    throw new Error('Conversation id is required');
  }

  const conversation = await models.DiscordConversations.findOne({
    erxesApiId: { $eq: conversationId },
  });

  if (!conversation?.channelId) {
    throw new Error('Discord conversation not found');
  }

  const bot = await models.DiscordBots.findOne({
    erxesApiId: conversation.integrationId,
  }).sort({ createdAt: -1 });

  if (!bot?.token) {
    throw new Error('Discord bot not found for this conversation');
  }

  return {
    token: bot.token,
    channelId: conversation.channelId,
    channelName: conversation.channelName,
    mirrorConversationId: conversation._id,
  };
};

const resolveOwnMessageContext = async (
  models: IModels,
  conversationId: string,
  messageId: string,
) => {
  if (!messageId) {
    throw new Error('Message id is required');
  }

  const context = await resolveChannelContext(models, conversationId);

  const message = await models.DiscordConversationMessages.findOne({
    messageId: { $eq: messageId },
    conversationId: context.mirrorConversationId,
  });

  if (!message) {
    throw new Error('This message is not part of this conversation');
  }

  if (!message.userId && !message.fromBot) {
    throw new Error(
      'Only messages sent from erxes can be edited or deleted — Discord does not allow acting on another author’s message',
    );
  }

  return context;
};

const CANNOT_EDIT_OTHERS_MESSAGE = 50005;

const runMessageAction = async <T>(
  action: 'edit' | 'delete',
  channelName: string | undefined,
  run: () => Promise<T>,
) => {
  try {
    return await run();
  } catch (e) {
    if (
      e instanceof DiscordApiError &&
      e.discordCode === CANNOT_EDIT_OTHERS_MESSAGE
    ) {
      throw new Error(
        'Only messages sent from erxes can be edited — Discord does not allow editing another author’s message',
      );
    }

    if (e instanceof DiscordApiError && e.status === 403) {
      throw new Error(
        `The Discord bot needs the "Manage Messages" permission in ${
          channelName ? `#${channelName}` : 'this channel'
        } to ${action} messages`,
      );
    }

    if (e instanceof DiscordApiError && e.status === 404) {
      throw new Error('This message no longer exists in the Discord channel');
    }

    throw e;
  }
};

export const discordMutations = {
  discordAddBot: (
    _root: undefined,
    args: IDiscordBot & { channelIds?: string[] },
    { models, user }: IContext,
  ) => models.DiscordBots.createBot({ ...args, createdBy: user._id }),

  discordUpdateBot: (
    _root: undefined,
    { _id, ...doc }: { _id: string } & IDiscordBotEditInput,
    { models, user }: IContext,
  ) => models.DiscordBots.updateBot(_id, { ...doc, updatedBy: user._id }),

  discordRemoveBot: (
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => models.DiscordBots.removeBot(_id),

  discordEditMessage: async (
    _root: undefined,
    {
      conversationId,
      messageId,
      content,
    }: { conversationId: string; messageId: string; content: string },
    { models }: IContext,
  ) => {
    const text = (content || '').trim();

    if (!text) {
      throw new Error('Message content is required');
    }

    const { token, channelId, channelName } = await resolveOwnMessageContext(
      models,
      conversationId,
      messageId,
    );
    await runMessageAction('edit', channelName, () =>
      editChannelMessage(token, channelId, messageId, text),
    );
    return { status: 'success' };
  },

  discordDeleteMessage: async (
    _root: undefined,
    { conversationId, messageId }: { conversationId: string; messageId: string },
    { models }: IContext,
  ) => {
    const { token, channelId, channelName } = await resolveOwnMessageContext(
      models,
      conversationId,
      messageId,
    );
    await runMessageAction('delete', channelName, () =>
      deleteChannelMessage(token, channelId, messageId),
    );
    return { status: 'success' };
  },
};
