import {
  AUTOMATION_ERROR_CODES,
  buildFailedAction,
  TAiContext,
  TAutomationProducers,
  TAutomationProducersInput,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { toAiMemoryScopes } from '@/inbox/meta/automation/aiMemoryScopes';
import { isAutomatedReplyPaused } from '@/inbox/services/automatedReplyPause';
import { findOpenConversationTickets } from '@/ticket/utils/conversationTickets';
import { getTelegramResponse } from '@/integrations/telegram/client';
import { actionSendTelegramMessage } from '@/integrations/telegram/meta/automation/sendMessage';
import {
  TELEGRAM_MESSAGE_COLLECTION,
  TTelegramTriggerConfig,
  TTelegramTriggerTarget,
} from '@/integrations/telegram/meta/automation/types';

const AI_HISTORY_LIMIT = 12;

const toKeywords = (value: unknown): string[] =>
  (typeof value === 'string' ? value : '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

const toISOString = (value?: Date | string) => {
  if (!value) return undefined;
  return value instanceof Date ? value.toISOString() : String(value);
};

// History stays strictly older than the message being handled, even when the
// run starts after newer ones arrived.
const toHistoryCutoff = (value?: Date | string) => {
  const date = value instanceof Date ? value : new Date(String(value || ''));
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const toHistoryRole = (message: { fromBot?: boolean; userId?: string }) => {
  if (message.fromBot) return 'bot' as const;
  if (message.userId) return 'agent' as const;
  return 'customer' as const;
};

export const matchesTelegramTrigger = (
  target: Partial<TTelegramTriggerTarget>,
  config?: TTelegramTriggerConfig,
) => {
  if ((config?.chatTypes ?? 'private') === 'private') {
    if (target.chatType !== 'private') return false;
  }

  const keywords = toKeywords(config?.keywords);
  const content = String(target.content || '').toLowerCase();

  return !keywords.length || keywords.some((word) => content.includes(word));
};

// "<bot> is typing…" while the workflow works on the reply; best effort.
const startTyping = async (
  models: IModels,
  target: Partial<TTelegramTriggerTarget>,
) => {
  const bot = await models.TelegramBots.findOne({
    erxesApiId: target.integrationId,
  }).select('+token');

  if (bot?.token && target.chatId) {
    await getTelegramResponse(bot.token, 'sendChatAction', {
      chat_id: target.chatId,
      action: 'typing',
    });
  }
};

export const telegramAutomationWorkers = {
  receiveActions: async (
    {
      action,
      execution,
      collectionType,
    }: TAutomationProducersInput[TAutomationProducers.RECEIVE_ACTIONS],
    { models, subdomain }: { models: IModels; subdomain: string },
  ) => {
    if (collectionType === TELEGRAM_MESSAGE_COLLECTION) {
      return await actionSendTelegramMessage({
        models,
        subdomain,
        action,
        execution,
      });
    }

    return buildFailedAction(
      `Telegram automations do not handle "${collectionType}"`,
      AUTOMATION_ERROR_CODES.CONFIG_INVALID,
    );
  },

  checkCustomTrigger: async (
    {
      collectionType,
      target,
      config,
    }: TAutomationProducersInput[TAutomationProducers.CHECK_CUSTOM_TRIGGER],
    { models }: { models: IModels; subdomain: string },
  ) => {
    if (collectionType !== TELEGRAM_MESSAGE_COLLECTION) {
      return false;
    }

    const triggerTarget = (target || {}) as Partial<TTelegramTriggerTarget>;

    if (
      !matchesTelegramTrigger(
        triggerTarget,
        config as TTelegramTriggerConfig | undefined,
      )
    ) {
      return false;
    }

    // A person has taken over the conversation: the bot stays out of it.
    const conversation = await models.Conversations.findOne(
      { _id: triggerTarget.conversationId },
      { automatedReplyControl: 1 },
    ).lean();

    if (await isAutomatedReplyPaused(models, conversation)) {
      return false;
    }

    startTyping(models, triggerTarget).catch(() => undefined);

    return true;
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

    const triggerTarget = target as TTelegramTriggerTarget;

    const context: TAiContext = {
      version: 1,
      input: {
        text: triggerTarget.content || '',
        id: triggerTarget._id,
        createdAt: toISOString(triggerTarget.createdAt),
      },
      facts: {
        conversationId: triggerTarget.conversationId,
        customerId: triggerTarget.customerId,
        triggerType,
      },
      memory: {
        scopeKey:
          triggerTarget.conversationId || triggerTarget.customerId || undefined,
        scopes: toAiMemoryScopes({
          conversationType: 'frontline:telegram.conversation',
          conversationId: triggerTarget.conversationId,
          customerId: triggerTarget.customerId,
        }),
      },
    };

    const conversation = await models.TelegramConversations.findOne({
      integrationId: triggerTarget.integrationId,
      erxesApiId: triggerTarget.conversationId,
    }).lean();

    if (conversation) {
      const historyCutoff = toHistoryCutoff(triggerTarget.createdAt);
      const messages = await models.TelegramConversationMessages.find({
        conversationId: conversation._id,
        _id: { $ne: triggerTarget._id },
        ...(historyCutoff ? { createdAt: { $lt: historyCutoff } } : {}),
      })
        .sort({ createdAt: -1 })
        .limit(AI_HISTORY_LIMIT)
        .lean();

      context.history = messages.reverse().map((message) => ({
        type: 'message',
        role: toHistoryRole(message),
        text: message.content || '',
        createdAt: toISOString(message.createdAt),
        meta: { id: message._id },
      }));
    }

    const openTickets = triggerTarget.conversationId
      ? await findOpenConversationTickets({
          models,
          conversationId: triggerTarget.conversationId,
        })
      : [];

    if (openTickets.length) {
      context.facts = { ...context.facts, openTickets };
    }

    return context;
  },
};
