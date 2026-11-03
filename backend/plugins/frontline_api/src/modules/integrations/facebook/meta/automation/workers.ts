import { toAiMemoryScopes } from '@/inbox/meta/automation/aiMemoryScopes';
import {
  actionCreateComment,
  checkCommentTrigger,
} from '@/integrations/facebook/meta/automation/comments';
import {
  actionCreateMessage,
  checkMessageTrigger,
} from '@/integrations/facebook/meta/automation/messages';
import { ICheckTriggerData } from '@/integrations/facebook/meta/automation/types/automationTypes';
import {
  AUTOMATION_ERROR_CODES,
  buildFailedAction,
  TAiContext,
  TAutomationProducers,
  TAutomationProducersInput,
} from 'erxes-api-shared/core-modules';

import {
  findOpenConversationTickets,
  resolveInboxConversationId,
} from '@/ticket/utils/conversationTickets';
import {
  formatMessageForAi,
  listAiMedia,
} from '@/integrations/facebook/meta/automation/utils/turnTaking';

const toISOString = (value?: Date | string) => {
  if (!value) {
    return undefined;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
};

// An execution can start seconds after its message, by which time newer
// messages exist. History must stay strictly older than the one being handled.
const toHistoryCutoff = (value?: Date | string) => {
  const date = value instanceof Date ? value : new Date(String(value || ''));

  return Number.isNaN(date.getTime()) ? undefined : date;
};

const toHistoryRole = (message: { fromBot?: boolean; userId?: string }) => {
  if (message.fromBot) {
    return 'bot' as const;
  }

  if (message.userId) {
    return 'agent' as const;
  }

  return 'customer' as const;
};

export const facebookAutomationWorkers = {
  receiveActions: async (
    {
      action,
      execution,
      collectionType,
    }: TAutomationProducersInput[TAutomationProducers.RECEIVE_ACTIONS],
    { models, subdomain },
  ) => {
    try {
      switch (collectionType) {
        case 'messages':
          return await actionCreateMessage({
            models,
            subdomain,
            action,
            execution,
          });
        case 'comments':
          return await actionCreateComment(
            models,
            subdomain,
            action,
            execution,
          );

        default:
          return buildFailedAction(
            `Facebook automations do not handle "${collectionType}"`,
            AUTOMATION_ERROR_CODES.CONFIG_INVALID,
          );
      }
    } catch (error) {
      // A dead token fails every run until reconnected; say so instead of UNKNOWN
      if (error instanceof Error && error.message.includes('access token')) {
        return buildFailedAction(
          error.message,
          AUTOMATION_ERROR_CODES.PROVIDER_ERROR,
        );
      }

      throw error;
    }
  },
  checkCustomTrigger: async (data: ICheckTriggerData, { subdomain }) => {
    const { collectionType } = data;
    switch (collectionType) {
      case 'messages':
        return await checkMessageTrigger(subdomain, data);

      case 'comments':
        return await checkCommentTrigger(subdomain, data);
      // case "ads":
      //   return await checkAdsTrigger(subdomain, data);
      default:
        return false;
    }
  },

  generateAiContext: async (
    {
      target,
      triggerType,
    }: TAutomationProducersInput[TAutomationProducers.GENERATE_AI_CONTEXT],
    { models, subdomain },
  ): Promise<TAiContext | null> => {
    if (!target) {
      return null;
    }

    const targetMessage = {
      _id: String(target._id || ''),
      content: typeof target.content === 'string' ? target.content : '',
      attachments: Array.isArray(target.attachments) ? target.attachments : [],
    };
    const context: TAiContext = {
      version: 1,
      input: {
        text: formatMessageForAi(targetMessage),
        id: target._id,
        createdAt: toISOString(target.createdAt),
      },
      facts: {
        conversationId: target.conversationId,
        customerId: target.customerId,
        botId: target.botId,
        triggerType,
      },
      memory: {
        scopeKey:
          (typeof target.conversationId === 'string' &&
            target.conversationId.trim()) ||
          (typeof target.customerId === 'string' && target.customerId.trim()) ||
          (typeof target._id === 'string' && target._id.trim()) ||
          undefined,
        scopes: toAiMemoryScopes({
          conversationType: 'frontline:facebook.conversation',
          conversationId: target.conversationId,
          customerId: target.customerId,
        }),
      },
    };

    if (!target.conversationId) {
      return context;
    }

    const historyCutoff = toHistoryCutoff(target.createdAt);
    const messages = (
      await models.FacebookConversationMessages.find({
        conversationId: target.conversationId,
        internal: { $ne: true },
        _id: { $ne: target._id },
        ...(historyCutoff ? { createdAt: { $lt: historyCutoff } } : {}),
      })
        .sort({ createdAt: -1 })
        .limit(12)
        .lean()
    ).reverse();

    // Everything the person sent since the last reply is one turn: a photo,
    // then a line about it, is answered together.
    let firstUnanswered = messages.length;

    while (
      firstUnanswered > 0 &&
      toHistoryRole(messages[firstUnanswered - 1]) === 'customer'
    ) {
      firstUnanswered--;
    }

    const unanswered = messages.slice(firstUnanswered);
    const customerMessages = [
      ...messages.filter((message) => toHistoryRole(message) === 'customer'),
      targetMessage,
    ];

    context.input = {
      ...context.input,
      text: [...unanswered, targetMessage]
        .map(formatMessageForAi)
        .filter(Boolean)
        .join('\n'),
    };
    context.history = messages.slice(0, firstUnanswered).map((message) => ({
      type: 'message',
      role: toHistoryRole(message),
      text:
        toHistoryRole(message) === 'customer'
          ? formatMessageForAi(message)
          : message.content || '',
      createdAt: toISOString(message.createdAt),
      meta: {
        id: message._id,
      },
    }));
    context.facts = {
      ...context.facts,
      // Ids a ticket tool may attach; the model picks, the ticket resolves.
      mediaIds: customerMessages.flatMap((message) =>
        listAiMedia(message).map(({ id }) => id),
      ),
    };

    const inboxConversationId = await resolveInboxConversationId(
      models,
      target.conversationId,
    );
    const openTickets = inboxConversationId
      ? await findOpenConversationTickets({
          models,
          conversationId: inboxConversationId,
        })
      : [];

    if (openTickets.length) {
      context.facts.openTickets = openTickets;
    }

    return context;
  },
};
