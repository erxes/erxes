import { IContext } from '~/connectionResolvers';
import { SortOrder } from 'mongoose';

export interface IKindParams {
  kind?: string;
}

export interface IDetailParams {
  erxesApiId: string;
}

export interface IMessagesParams {
  conversationId: string;
  limit?: number;
  skip?: number;
  getFirst?: boolean;
}

const buildSelector = async (conversationId: string, { models }: IContext) => {
  const query = { conversationId: '' };
  const conversation = await models.WhatsappConversations.findOne({
    erxesApiId: conversationId,
  });

  if (conversation) {
    query.conversationId = conversation._id;
  }

  return query;
};

export const whatsappQueries = {
  async whatsappGetConfigs(_root, _args, { models }: IContext) {
    return models.WhatsappConfigs.find({});
  },

  async whatsappGetIntegrations(
    _root,
    { kind }: IKindParams,
    { models }: IContext,
  ) {
    const selector = kind ? { kind } : {};

    return models.WhatsappIntegrations.find(selector);
  },

  async whatsappGetIntegrationDetail(
    _root,
    { erxesApiId }: IDetailParams,
    { models }: IContext,
  ) {
    return models.WhatsappIntegrations.findOne({ erxesApiId });
  },

  async whatsappConversationMessages(
    _root,
    args: IMessagesParams,
    context: IContext,
  ) {
    const { conversationId, limit, skip, getFirst } = args;
    const selector = await buildSelector(conversationId, context);
    const sort: { createdAt: SortOrder } = {
      createdAt: getFirst ? 1 : -1,
    };

    const query = context.models.WhatsappConversationMessages.find(selector)
      .sort(sort)
      .skip(skip || 0);

    if (limit) {
      query.limit(limit);
    }

    const messages = await query;

    return getFirst ? messages : messages.reverse();
  },

  async whatsappConversationMessagesCount(
    _root,
    { conversationId }: { conversationId: string },
    context: IContext,
  ) {
    const selector = await buildSelector(conversationId, context);

    return context.models.WhatsappConversationMessages.countDocuments(selector);
  },
};
