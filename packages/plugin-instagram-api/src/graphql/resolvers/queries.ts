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

const buildSelector = async (conversationId: string, model: any) => {
  const query = { conversationId: '' };

  const conversation = await model.findOne({
    erxesApiId: conversationId,
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

  async instagramGetIntegrationDetail(
    _root,
    { erxesApiId }: IDetailParams,
    { models }: IContext,
  ) {
    return models.Integrations.findOne({ erxesApiId });
  },

  async instagramGetConfigs(_root, _args, { models }: IContext) {
    return models.Configs.find({}).lean();
  },

  async instagramGetComments(
    _root,
    args: ICommentsParams,
    { models }: IContext,
  ) {
    const {
      conversationId,
      isResolved,
      commentId,
      senderId,
      limit = 10,
    } = args;
    const post = await models.PostConversations.findOne({
      erxesApiId: conversationId,
    });

    const query: {
      postId: string;
      isResolved?: boolean;
      parentId?: string;
      senderId?: string;
    } = {
      postId: post ? post.postId || '' : '',
      isResolved: isResolved === true,
    };

    if (senderId && senderId !== 'undefined') {
      const customer = await models.Customers.findOne({ erxesApiId: senderId });

      if (customer && customer.userId) {
        query.senderId = customer.userId;
      }
    } else {
      query.parentId = commentId !== 'undefined' ? commentId : '';
    }

    const result = await models.CommentConversation.aggregate([
      {
        $match: query,
      },
      {
        $lookup: {
          from: 'customers_instagrams',
          localField: 'senderId',
          foreignField: 'userId',
          as: 'customer',
        },
      },
      {
        $unwind: {
          path: '$customer',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'posts_conversations_instagrams',
          localField: 'postId',
          foreignField: 'postId',
          as: 'post',
        },
      },
      {
        $unwind: {
          path: '$post',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'comments_instagrams',
          localField: 'commentId',
          foreignField: 'parentId',
          as: 'replies',
        },
      },
      {
        $addFields: {
          commentCount: { $size: '$replies' },
          'customer.avatar': '$customer.profilePic',
          'customer._id': '$customer.erxesApiId',
          conversationId: '$post.erxesApiId',
        },
      },

      { $sort: { timestamp: -1 } },
      { $limit: limit },
    ]);

    return result.reverse();
  },

  async instagramGetCommentCount(_root, args, { models }: IContext) {
    const { conversationId, isResolved = false } = args;

    const commentCount = await models.CommentConversation.countDocuments({
      erxesApiId: conversationId,
    });

    const comments = await models.CommentConversation.find({
      erxesApiId: conversationId,
    });
    // Extracting comment_ids from the comments array
    const comment_ids = comments?.map((item) => item.comment_id);

    // Using the extracted comment_ids to search for matching comments
    const search = await models.CommentConversation.find({
      comment_id: { $in: comment_ids }, // Using $in to find documents with comment_ids in the extracted array
    });

    if (search.length > 0) {
      // Returning the count of matching comments
      return {
        commentCount: commentCount,
        searchCount: search.length,
      };
    }

    // If no matching comments are found, return only the commentCount
    return {
      commentCount: commentCount,
      searchCount: 0,
    };
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
          { $set: { healthStatus: 'account-token', error: `${e.message}` } },
        );
      }
    }

    return pages;
  },

  async instagramConversationDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    const conversation = await models.Conversations.findOne({ _id });
    if (conversation) {
      return conversation;
    }
    return models.CommentConversation.findOne({ _id });
  },

  async instagramConversationMessages(
    _root,
    args: IMessagesParams,
    { models }: IContext,
  ) {
    const { conversationId, limit, skip, getFirst } = args;

    const conversation = await models.Conversations.findOne({
      erxesApiId: conversationId,
    });
    let messages: IConversationMessageDocument[] = [];
    const query = await buildSelector(conversationId, models.Conversations);
    if (conversation) {
      if (limit) {
        const sort: any = getFirst ? { createdAt: 1 } : { createdAt: -1 };

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
    } else {
      let comment: any[] = [];
      const sort: any = getFirst ? { createdAt: 1 } : { createdAt: -1 };
      comment = await models.CommentConversation.find({
        erxesApiId: conversationId,
      })
        .sort(sort)
        .skip(skip || 0);

      const comment_ids = comment?.map((item) => item.comment_id);
      const search = await models.CommentConversationReply.find({
        parentId: comment_ids,
      })
        .sort(sort)
        .skip(skip || 0);

      if (search.length > 0) {
        // Combine the arrays and sort by createdAt in ascending order
        return [...comment, ...search].sort((a, b) =>
          a.createdAt > b.createdAt ? 1 : -1,
        );
      } else {
        return comment;
      }
    }
  },
  /**
   *  Get all conversation messages count. We will use it in pager
   */
  async instagramConversationMessagesCount(
    _root,
    { conversationId }: { conversationId: string },
    { models }: IContext,
  ) {
    const selector = await buildSelector(conversationId, models.Conversations);

    return models.ConversationMessages.countDocuments(selector);
  },

  async instagramGetPost(
    _root,
    { erxesApiId }: IDetailParams,
    { models }: IContext,
  ) {
    const comment = await models.CommentConversation.findOne({
      erxesApiId: erxesApiId,
    });

    if (comment) {
      return await models.PostConversations.findOne({
        postId: comment.postId,
      });
    }

    // Return null or some appropriate value when comment is not found
    return null;
  },

  async instagramHasTaggedMessages(
    _root,
    { conversationId }: IConversationId,
    { models, subdomain }: IContext,
  ) {
    const commonParams = { isRPC: true, subdomain };
    const inboxConversation = await sendInboxMessage({
      ...commonParams,
      action: 'conversations.findOne',
      data: { query: { _id: conversationId } },
    });

    let integration;

    if (inboxConversation) {
      integration = await sendInboxMessage({
        ...commonParams,
        action: 'integrations.findOne',
        data: { _id: inboxConversation.integrationId },
      });
    }

    if (integration && integration.kind !== INTEGRATION_KINDS.MESSENGER) {
      return false;
    }

    const query = await buildSelector(conversationId, models.Conversations);

    const messages = await models.ConversationMessages.find({
      ...query,
      customerId: { $exists: true },
      createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    })
      .limit(2)
      .lean();

    if (messages.length >= 1) {
      return false;
    }
    return true;
  },

  async instagramPostMessages(
    _root,
    args: IMessagesParams,
    { models }: IContext,
  ) {
    const { conversationId, limit, skip, getFirst } = args;
    let messages: any[] = [];
    const query = await buildSelector(conversationId, models.PostConversations);

    if (limit) {
      const sort: any = getFirst ? { createdAt: 1 } : { createdAt: -1 };

      messages = await models.CommentConversation.find(query)
        .sort(sort)
        .skip(skip || 0)
        .limit(limit);

      return getFirst ? messages : messages.reverse();
    }

    messages = await models.CommentConversation.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    return messages.reverse();
  },
};

export default instagramQueries;
