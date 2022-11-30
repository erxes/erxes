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

const facebookQueries = {
  async facebookGetAccounts(_root, { kind }: IKind, { models }: IContext) {
    return models.Accounts.find({ kind });
  },

  async facebookGetIntegrations(_root, { kind }: IKind, { models }: IContext) {
    return models.Integrations.find({ kind });
  },

  facebookGetIntegrationDetail(
    _root,
    { erxesApiId }: IDetailParams,
    { models }: IContext
  ) {
    return models.Integrations.findOne({ erxesApiId });
  },

  facebookGetConfigs(_root, _args, { models }: IContext) {
    return models.Configs.find({}).lean();
  },

  async facebookGetComments(
    _root,
    args: ICommentsParams,
    { models }: IContext
  ) {
    const {
      conversationId,
      isResolved,
      commentId,
      senderId,
      limit = 10
    } = args;
    const post = await models.Posts.getPost({ erxesApiId: conversationId });

    const query: {
      postId: string;
      isResolved?: boolean;
      parentId?: string;
      senderId?: string;
    } = {
      postId: post.postId,
      isResolved: isResolved === true
    };

    if (senderId && senderId !== 'undefined') {
      const customer = await models.Customers.findOne({ erxesApiId: senderId });

      if (customer && customer.userId) {
        query.senderId = customer.userId;
      }
    } else {
      query.parentId = commentId !== 'undefined' ? commentId : '';
    }

    const result = await models.Comments.aggregate([
      {
        $match: query
      },
      {
        $lookup: {
          from: 'customers_facebooks',
          localField: 'senderId',
          foreignField: 'userId',
          as: 'customer'
        }
      },
      {
        $unwind: {
          path: '$customer',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'posts_facebooks',
          localField: 'postId',
          foreignField: 'postId',
          as: 'post'
        }
      },
      {
        $unwind: {
          path: '$post',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'comments_facebooks',
          localField: 'commentId',
          foreignField: 'parentId',
          as: 'replies'
        }
      },
      {
        $addFields: {
          commentCount: { $size: '$replies' },
          'customer.avatar': '$customer.profilePic',
          'customer._id': '$customer.erxesApiId',
          conversationId: '$post.erxesApiId'
        }
      },

      { $sort: { timestamp: -1 } },
      { $limit: limit }
    ]);

    return result.reverse();
  },

  async facebookGetCommentCount(_root, args, { models }: IContext) {
    const { conversationId, isResolved = false } = args;

    const post = await models.Posts.getPost(
      { erxesApiId: conversationId },
      true
    );

    const commentCount = await models.Comments.countDocuments({
      postId: post.postId,
      isResolved
    });
    const commentCountWithoutReplies = await models.Comments.countDocuments({
      postId: post.postId,
      isResolved,
      parentId: null
    });

    return {
      commentCount,
      commentCountWithoutReplies
    };
  },

  async facebookGetPages(_root, args, { models }: IContext) {
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

  facebookConversationDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.Conversations.findOne({ _id });
  },

  async facebookConversationMessages(
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
  async facebookConversationMessagesCount(
    _root,
    { conversationId }: { conversationId: string },
    { models }: IContext
  ) {
    const selector = await buildSelector(conversationId, models);

    return models.ConversationMessages.countDocuments(selector);
  },

  facebookGetPost(_root, { erxesApiId }: IDetailParams, { models }: IContext) {
    return models.Posts.findOne({ erxesApiId });
  },

  async facebookHasTaggedMessages(
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

export default facebookQueries;
