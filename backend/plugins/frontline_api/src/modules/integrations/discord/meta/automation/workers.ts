import {
  TAiContext,
  TAutomationProducers,
  TAutomationProducersInput,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { actionSendDiscordMessage } from '@/integrations/discord/meta/automation/sendMessage';
import { DISCORD_MESSAGE_COLLECTION } from '@/integrations/discord/constants';
import {
  TDiscordTriggerConfig,
  TDiscordTriggerTarget,
} from '@/integrations/discord/meta/automation/types';
import {
  AUTOMATION_TYPING_MAX_MS,
  getErrorMessage,
  startTypingIndicator,
} from '@/integrations/discord/utils';
import { debugError } from '@/integrations/discord/debuggers';

const toFilterList = (value: unknown): string[] =>
  (typeof value === 'string' ? value : '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

const toISOString = (value?: Date | string) => {
  if (!value) return undefined;
  return value instanceof Date ? value.toISOString() : String(value);
};

// An execution can start seconds after its message, by which time newer
// messages exist. History must stay strictly older than the one being handled.
const toHistoryCutoff = (value?: Date | string) => {
  const date = value instanceof Date ? value : new Date(String(value || ''));
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const toHistoryRole = (message: { fromBot?: boolean; userId?: string }) => {
  if (message.fromBot) return 'bot' as const;
  if (message.userId) return 'agent' as const;
  return 'customer' as const;
};

const startTypingForMatchedTrigger = async (
  models: IModels,
  target: TDiscordTriggerTarget,
) => {
  try {
    const botId = target?.botId;
    const channelId = target?.channelId;
    if (!botId || !channelId) {
      return;
    }
    const bot = await models.DiscordBots.findById(botId);
    if (bot?.token) {
      startTypingIndicator(bot.token, channelId, AUTOMATION_TYPING_MAX_MS);
    }
  } catch (e) {
    debugError(
      `Failed to start Discord typing indicator: ${getErrorMessage(e)}`,
    );
  }
};

export const discordAutomationWorkers = {
  receiveActions: async (
    {
      action,
      execution,
      collectionType,
    }: TAutomationProducersInput[TAutomationProducers.RECEIVE_ACTIONS],
    { models, subdomain }: { models: IModels; subdomain: string },
  ) => {
    if (collectionType === DISCORD_MESSAGE_COLLECTION) {
      return await actionSendDiscordMessage({
        models,
        subdomain,
        action,
        execution,
      });
    }

    return { result: null };
  },

  checkCustomTrigger: (
    {
      collectionType,
      target,
      config,
    }: TAutomationProducersInput[TAutomationProducers.CHECK_CUSTOM_TRIGGER],
    { models }: { models: IModels; subdomain: string },
  ) => {
    if (collectionType === DISCORD_MESSAGE_COLLECTION) {
      const triggerTarget = target as TDiscordTriggerTarget;
      const triggerConfig = config as TDiscordTriggerConfig | undefined;

      const keywords = toFilterList(triggerConfig?.keywords);
      const content = String(triggerTarget?.content || '').toLowerCase();
      const matched =
        !keywords.length ||
        keywords.some((keyword) => content.includes(keyword));

      if (matched) {
        startTypingForMatchedTrigger(models, triggerTarget).catch(
          () => undefined,
        );
      }

      return matched;
    }

    return false;
  },

  generateAiContext: async (
    {
      target,
      triggerType,
    }: TAutomationProducersInput[TAutomationProducers.GENERATE_AI_CONTEXT],
    { models }: { models: IModels },
  ): Promise<TAiContext | null> => {
    if (!target) {
      return null;
    }

    const triggerTarget = target as TDiscordTriggerTarget;

    const context: TAiContext = {
      version: 1,
      input: {
        text:
          typeof triggerTarget.content === 'string'
            ? triggerTarget.content
            : '',
        id: triggerTarget._id,
        createdAt: toISOString(triggerTarget.createdAt),
      },
      facts: {
        conversationId: triggerTarget.conversationId,
        customerId: triggerTarget.customerId,
        channelId: triggerTarget.channelId,
        triggerType,
      },
      memory: {
        scopeKey:
          (typeof triggerTarget.conversationId === 'string' &&
            triggerTarget.conversationId.trim()) ||
          (typeof triggerTarget.customerId === 'string' &&
            triggerTarget.customerId.trim()) ||
          undefined,
      },
    };

    const conversation = await models.DiscordConversations.findOne({
      erxesApiId: triggerTarget.conversationId,
    });

    if (!conversation) {
      return context;
    }

    const historyCutoff = toHistoryCutoff(triggerTarget.createdAt);
    const messages = await models.DiscordConversationMessages.find({
      conversationId: conversation._id,
      internal: { $ne: true },
      deletedAt: { $exists: false },
      messageId: { $ne: triggerTarget._id },
      ...(historyCutoff ? { createdAt: { $lt: historyCutoff } } : {}),
    })
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

    context.history = messages.reverse().map((message) => ({
      type: 'message',
      role: toHistoryRole(message),
      text: message.content || '',
      createdAt: toISOString(message.createdAt),
      meta: { id: message._id },
    }));

    return context;
  },
};
