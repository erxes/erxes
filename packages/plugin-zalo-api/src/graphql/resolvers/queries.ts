import { IContext, IModels } from '../../models';
import { IConversationMessageDocument } from '../../models/ConversationMessages';
// import { Accounts, Messages } from '../../models';
import { debug } from '../../configs';

interface IKind {
  kind: string;
}

interface IMessagesParams {
  conversationId: string;
  skip?: number;
  limit?: number;
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

const queries = {
  async zaloGetAccounts(_root, { kind }: IKind, { models }: IContext) {
    return models.Accounts.find({}).lean();
  },

  async zaloGetIntegrations(_root, { kind }: IKind, { models }: IContext) {
    return models.Integrations.find({ kind });
  },

  async zaloGetConfigs(_root, _args, { models }: IContext) {
    return models.Configs.find({}).lean();
  },

  zaloConversationDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.Conversations.findOne({ _id });
  },

  async zaloConversationMessages(
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

    // debug.error(`ConversationMessages query: ${JSON.stringify(query)}`)
    // debug.error(`ConversationMessages: ${JSON.stringify(messages)}`)

    return messages.reverse();
  },

  /**
   *  Get all conversation messages count. We will use it in pager
   */
  async zaloConversationMessagesCount(
    _root,
    { conversationId }: { conversationId: string },
    { models }: IContext
  ) {
    const selector = await buildSelector(conversationId, models);

    return models.ConversationMessages.countDocuments(selector);
  }

  // async zaloConversationDetail(
  //   _root,
  //   { conversationId },
  //   _context: IContext
  // ) {
  //   const messages = await Messages.find({
  //     inboxConversationId: conversationId
  //   });

  //   const convertEmails = emails =>
  //     (emails || []).map(item => ({ name: item.name, email: item.address }));

  //   return messages.map(message => {
  //     return {
  //       _id: message._id,
  //       mailData: {
  //         messageId: message.messageId,
  //         from: convertEmails(message.from),
  //         to: convertEmails(message.to),
  //         cc: convertEmails(message.cc),
  //         bcc: convertEmails(message.bcc),
  //         subject: message.subject,
  //         body: message.body,
  //       }
  //     };
  //   });
  // },

  // async zaloAccounts(_root, _args, _context: IContext) {
  //   return Accounts.getAccounts();
  // }
};

export default queries;
