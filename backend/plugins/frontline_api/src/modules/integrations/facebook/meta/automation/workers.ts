import {
  actionCreateComment,
  checkCommentTrigger,
} from '@/integrations/facebook/meta/automation/comments';
import {
  actionCreateMessage,
  checkMessageTrigger,
} from '@/integrations/facebook/meta/automation/messages';
import {
  ICheckTriggerData,
  IReplacePlaceholdersData,
} from '@/integrations/facebook/meta/automation/types/automationTypes';
import {
  replacePlaceHolders,
  TAiContext,
  setProperty,
  TAutomationProducers,
  TAutomationProducersInput,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';

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

const getItems = async (
  subdomain: string,
  module: string,
  execution: any,
  targetType: string,
) => {
  const { target } = execution;
  if (module === targetType) {
    return [target];
  }
  return [];
};

const getRelatedValue = async () => {
  return false;
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
  replacePlaceHolders: async (
    data: IReplacePlaceholdersData,
    { models, subdomain },
  ) => {
    const { target, config, relatedValueProps } = data;

    return await replacePlaceHolders<IModels>({
      models,
      subdomain,
      customResolver: { resolver: getRelatedValue, props: relatedValueProps },
      actionData: config,
      target,
    });
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

  setProperties: async (
    {
      action,
      execution,
      targetType,
    }: TAutomationProducersInput[TAutomationProducers.SET_PROPERTIES],
    { models, subdomain },
  ) => {
    const { module, rules } = action.config;
    const relatedItems = await getItems(
      subdomain,
      module,
      execution,
      targetType,
    );
    return await setProperty({
      models,
      subdomain,
      getRelatedValue,
      module,
      rules,
      execution,
      relatedItems,
      targetType,
    });
  },
};
