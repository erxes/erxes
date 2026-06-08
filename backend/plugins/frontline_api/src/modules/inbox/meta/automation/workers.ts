import {
  TAiContext,
  TAutomationProducers,
  TAutomationProducersInput,
} from 'erxes-api-shared/core-modules';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { pConversationClientMessageInserted } from '~/modules/inbox/graphql/resolvers/mutations/widget';

const toISOString = (value?: Date | string): string | undefined => {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();
  return String(value);
};

const toHistoryRole = (message: {
  fromBot?: boolean;
  userId?: string;
  customerId?: string;
}): 'bot' | 'agent' | 'customer' => {
  if (message.fromBot) return 'bot';
  if (message.userId) return 'agent';
  return 'customer';
};

const resolveTemplateString = (text: string, prevAction?: any): string => {
  return text.replace(/{{\s*([\w.]+)\s*}}/g, (match, path) => {
    const segments = path.split('.');
    let value: any = { prevAction };
    for (const segment of segments) {
      if (value === null || value === undefined) return match;
      value = value[segment];
    }
    if (value === null || value === undefined) return match;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  });
};

export const inboxAutomationWorkers = {
  generateAiContext: async (
    {
      target,
      triggerType,
    }: TAutomationProducersInput[TAutomationProducers.GENERATE_AI_CONTEXT],
    { models }: { models: IModels; subdomain: string },
  ): Promise<TAiContext | null> => {
    if (!target) return null;

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

    if (!target.conversationId) return context;

    const messages = await models.ConversationMessages.find({
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
      meta: { id: message._id },
    }));

    return context;
  },

  checkCustomTrigger: async (
    {
      collectionType,
    }: TAutomationProducersInput[TAutomationProducers.CHECK_CUSTOM_TRIGGER],
    _context: { models: IModels; subdomain: string },
  ) => {
    return collectionType === 'messages';
  },

  receiveActions: async (
    {
      action,
      execution,
      collectionType,
    }: TAutomationProducersInput[TAutomationProducers.RECEIVE_ACTIONS],
    { models, subdomain }: { models: IModels; subdomain: string },
  ) => {
    if (collectionType !== 'messages') {
      return { result: null };
    }

    const { target } = execution;
    const { conversationId } = target || {};

    if (!conversationId) return { result: null };

    try {
      const config = action.config || {};
      const text = resolveTemplateString(
        config.text || '',
        execution.actions?.at(-1)?.result,
      );

      if (!text) return { result: null };

      const botData = [{ type: 'text', text: `<p>${text}</p>` }];

      const botMessage = await models.ConversationMessages.createMessage({
        conversationId,
        content: text,
        botData,
        fromBot: true,
      });

      graphqlPubsub.publish(
        `conversationMessageInserted:${botMessage.conversationId}`,
        { conversationMessageInserted: botMessage },
      );

      await pConversationClientMessageInserted(subdomain, botMessage);

      return {
        result: {
          _id: botMessage._id,
          conversationId: botMessage.conversationId,
          content: text,
        },
      };
    } finally {
      graphqlPubsub.publish(`conversationBotTypingStatus:${conversationId}`, {
        conversationBotTypingStatus: { conversationId, typing: false },
      });
    }
  },
};
