import { IContext, IModels } from '../../connectionResolver';
import { INTEGRATION_KINDS } from '../../constants';
import { sendInboxMessage } from '../../messageBroker';
import { IConversationMessageDocument } from '../../models/definitions/conversationMessages';
import { getPageList } from '../../utils';

interface IKind {
  kind: string;
}

interface IDetailParams {
  erxesApiId: string;
}

interface IConversationId {
  conversationId: string;
}

interface IPageParams {
  skip?: number;
  limit?: number;
}

interface ICommentsParams extends IConversationId, IPageParams {
  isResolved?: boolean;
  commentId?: string;
  senderId: string;
}

interface IMessagesParams extends IConversationId, IPageParams {
  getFirst?: boolean;
}

const buildSelector = async (conversationId: string, models: IModels) => {
  const query = { conversationId: '' };

  const conversation = await models.Conversations.findOne({
    erxesApiId: conversationId
  });

  if (conversation) {
    query.conversationId = conversation._id;
  }

  return query;
};

const instagramQueries = {
  async instagramGetAccounts(_root, { kind }: IKind, { models }: IContext) {
    return models.Accounts.find({ kind });
  },

  async instagramGetIntegrations(_root, { kind }: IKind, { models }: IContext) {
    return models.Integrations.find({ kind });
  },

  instagramGetIntegrationDetail(
    _root,
    { erxesApiId }: IDetailParams,
    { models }: IContext
  ) {
    return models.Integrations.findOne({ erxesApiId });
  },

  instagramGetConfigs(_root, _args, { models }: IContext) {
    return models.Configs.find({}).lean();
  },

  async instagramGetPages(_root, args, { models }: IContext) {
    const { kind, accountId } = args;
    const account = await models.Accounts.getAccount({ _id: accountId });
    const accessToken = account.token;
    let pages: any[] = [];

    try {
      pages = await getPageList(models, accessToken, kind);
    } catch (e) {
      if (!e.message.includes('Application request limit reached')) {
        await models.Integrations.updateOne(
          { accountId },
          { $set: { healthStatus: 'account-token', error: `${e.message}` } }
        );
      }
    }

    return pages;
  },

  async instagramConversationMessages(
    _root,
    args: IMessagesParams,
    { models }: IContext
  ) {
    const { conversationId, limit, skip, getFirst } = args;

    let messages: IConversationMessageDocument[] = [];
    const query = await buildSelector(conversationId, models);

    if (limit) {
      const sort = getFirst ? { createdAt: 1 } : { createdAt: -1 };

      messages = await models.ConversationMessages.find(query)
        .sort(sort)
        .skip(skip || 0)
        .limit(limit);

      return getFirst ? messages : messages.reverse();
    }

    messages = await models.ConversationMessages.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    return messages.reverse();
  },

  /**
   *  Get all conversation messages count. We will use it in pager
   */
  async instagramConversationMessagesCount(
    _root,
    { conversationId }: { conversationId: string },
    { models }: IContext
  ) {
    const selector = await buildSelector(conversationId, models);

    return models.ConversationMessages.countDocuments(selector);
  },

  async instagramHasTaggedMessages(
    _root,
    { conversationId }: IConversationId,
    { models, subdomain }: IContext
  ) {
    const commonParams = { isRPC: true, subdomain };

    const inboxConversation = await sendInboxMessage({
      ...commonParams,
      action: 'conversations.findOne',
      data: { query: { _id: conversationId } }
    });

    let integration;

    if (inboxConversation) {
      integration = await sendInboxMessage({
        ...commonParams,
        action: 'integrations.findOne',
        data: { _id: inboxConversation.integrationId }
      });
    }

    if (integration && integration.kind !== INTEGRATION_KINDS.MESSENGER) {
      return false;
    }

    const query = await buildSelector(conversationId, models);

    const messages = await models.ConversationMessages.find({
      ...query,
      customerId: { $exists: true },
      createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    })
      .limit(2)
      .lean();

    if (messages.length >= 1) {
      return false;
    }

    return true;
  }
};

export default instagramQueries;
