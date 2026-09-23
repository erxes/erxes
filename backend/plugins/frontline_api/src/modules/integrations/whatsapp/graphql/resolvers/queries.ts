import { IContext } from '~/connectionResolvers';
import { SortOrder } from 'mongoose';
import { getWhatsappBusinessAccounts } from '@/integrations/whatsapp/utils';

export interface IMessagesParams {
  conversationId: string;
  limit?: number;
  skip?: number;
  getFirst?: boolean;
}

export interface IBusinessAccountsParams {
  accountId: string;
  pageId?: string;
}

const DEFAULT_MESSAGE_LIMIT = 20;
const MAX_MESSAGE_LIMIT = 100;

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
  async whatsappGetConfigs(_root, _args, { models, checkPermission }: IContext) {
    await checkPermission('integrationsEdit');

    return models.WhatsappConfigs.find({});
  },

  async whatsappGetBusinessAccounts(
    _root,
    { accountId, pageId }: IBusinessAccountsParams,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('integrationsEdit');

    const account = await models.FacebookAccounts.findOne({ _id: accountId });

    if (!account) {
      throw new Error('Facebook account not found');
    }

    return getWhatsappBusinessAccounts(account.token, pageId);
  },

  async whatsappConversationMessages(
    _root,
    args: IMessagesParams,
    context: IContext,
  ) {
    await context.checkPermission('showConversations');

    const { conversationId, getFirst } = args;
    const limit = Math.min(
      Math.max(args.limit || DEFAULT_MESSAGE_LIMIT, 1),
      MAX_MESSAGE_LIMIT,
    );
    const skip = Math.max(args.skip || 0, 0);
    const selector = await buildSelector(conversationId, context);
    const sort: { createdAt: SortOrder } = {
      createdAt: getFirst ? 1 : -1,
    };

    const messages = await context.models.WhatsappConversationMessages.find(
      selector,
    )
      .sort(sort)
      .skip(skip)
      .limit(limit);

    return getFirst ? messages : messages.reverse();
  },

  async whatsappConversationMessagesCount(
    _root,
    { conversationId }: { conversationId: string },
    context: IContext,
  ) {
    await context.checkPermission('showConversations');

    const selector = await buildSelector(conversationId, context);

    return context.models.WhatsappConversationMessages.countDocuments(selector);
  },
};
