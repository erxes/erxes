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
  TAiContext,
  TAutomationProducers,
  TAutomationProducersInput,
} from 'erxes-api-shared/core-modules';

const toISOString = (value?: Date | string) => {
  if (!value) {
    return undefined;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
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
    switch (collectionType) {
      case 'messages':
        return await actionCreateMessage({
          models,
          subdomain,
          action,
          execution,
        });
      case 'comments':
        return await actionCreateComment(models, subdomain, action, execution);

      default:
        return { result: null };
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
    { models },
  ): Promise<TAiContext | null> => {
    if (!target) {
      return null;
    }

    const context: TAiContext = {
      version: 1,
      input: {
        text: typeof target.content === 'string' ? target.content : '',
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
      },
    };

    if (!target.conversationId) {
      return context;
    }

    const messages = await models.FacebookConversationMessages.find({
      conversationId: target.conversationId,
      internal: { $ne: true },
      _id: { $ne: target._id },
    })
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

    context.history = messages.reverse().map((message) => ({
      type: 'message',
      role: toHistoryRole(message),
      text: message.content || '',
      createdAt: toISOString(message.createdAt),
      meta: {
        id: message._id,
      },
    }));

    return context;
  },
};
