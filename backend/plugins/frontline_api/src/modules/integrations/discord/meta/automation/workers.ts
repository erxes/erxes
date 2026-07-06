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

// Splits a comma-separated config value into a lowercased, trimmed list.
const toFilterList = (value: unknown): string[] =>
  String(value || '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

/** Coerce a Date or string to an ISO string, or undefined when empty. */
const toISOString = (value?: Date | string) => {
  if (!value) return undefined;
  return value instanceof Date ? value.toISOString() : String(value);
};

/** Map a stored message to its AI-history role: bot, agent, or customer. */
const toHistoryRole = (message: { fromBot?: boolean; userId?: string }) => {
  if (message.fromBot) return 'bot' as const;
  if (message.userId) return 'agent' as const;
  return 'customer' as const;
};

// Best-effort "<bot> is typing…" for a matched Discord trigger. Resolves the
// bot token from the target and starts the channel typing indicator (which
// self-caps and is cleared once the reply is sent). Never throws — the trigger
// match result must not depend on Discord availability.
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
      // Longer cap than the default: the reply isn't sent until the automation's
      // Send Discord Message action fires, and the AI Agent action between here
      // and there can run for tens of seconds. Keep "…is typing" alive across
      // the whole compose window instead of self-expiring mid-generation.
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
    // Discord message trigger: optional content keyword filter. The bridge
    // transports target/config as untyped records; cast them back to the
    // shapes the Discord trigger produces.
    if (collectionType === DISCORD_MESSAGE_COLLECTION) {
      const triggerTarget = target as TDiscordTriggerTarget;
      const triggerConfig = config as TDiscordTriggerConfig | undefined;

      const keywords = toFilterList(triggerConfig?.keywords);
      const content = String(triggerTarget?.content || '').toLowerCase();
      const matched =
        !keywords.length ||
        keywords.some((keyword) => content.includes(keyword));

      // Only now — once an automation's trigger has actually matched — start the
      // typing indicator, so it shows while the automation composes its reply.
      // Gating it here (rather than on every inbound message) means channels and
      // messages with no matching automation never show a typing indicator.
      // Fire-and-forget so the match result isn't delayed by Discord I/O.
      if (matched) {
        startTypingForMatchedTrigger(models, triggerTarget).catch(
          () => undefined,
        );
      }

      return matched;
    }

    return false;
  },

  // Feeds the AI Agent action recent conversation history for context-aware
  // replies. Mirrors Facebook's generateAiContext.
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
          typeof triggerTarget.content === 'string' ? triggerTarget.content : '',
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

    // target.conversationId is the inbox conversation id (erxesApiId).
    const conversation = await models.DiscordConversations.findOne({
      erxesApiId: triggerTarget.conversationId,
    });

    if (!conversation) {
      return context;
    }

    const messages = await models.DiscordConversationMessages.find({
      conversationId: conversation._id,
      internal: { $ne: true },
      messageId: { $ne: triggerTarget._id },
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
