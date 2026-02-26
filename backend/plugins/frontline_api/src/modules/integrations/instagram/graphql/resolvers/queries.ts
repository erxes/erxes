import { IContext } from '~/connectionResolvers';
import {
  getPageList,
  fetchPagesPostsList,
  fetchPagePosts,
  fetchPagePost,
} from '@/integrations/instagram/utils';
import {
  IKind,
  IDetailParams,
  ICommentsParams,
  IMessagesParams,
  IConversationId,
} from '@/integrations/instagram/@types/utils';
import { INTEGRATION_KINDS } from '@/integrations/instagram/constants';
import { IInstagramConversationMessageDocument } from '@/integrations/instagram/@types/conversationMessages';

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

export const instagramQueries = {
  async instagramGetAccounts(_root, { kind }: IKind, { models }: IContext) {
    return models.InstagramAccounts.find({ kind });
  },

  async instagramGetIntegrations(_root, { kind }: IKind, { models }: IContext) {
    return models.InstagramIntegrations.find({ kind });
  },

  async instagramGetIntegrationDetail(
    _root,
    { erxesApiId }: IDetailParams,
    { models }: IContext,
  ) {
    return models.InstagramIntegrations.findOne({ erxesApiId });
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
    const post = await models.InstagramPostConversations.findOne({
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
      const customer = await models.InstagramCustomers.findOne({
        erxesApiId: senderId,
      });

      if (customer && customer.userId) {
        query.senderId = customer.userId;
      }
    } else {
      query.parentId = commentId !== 'undefined' ? commentId : '';
    }

    const result = await models.InstagramCommentConversation.aggregate([
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

    const commentCount =
      await models.InstagramCommentConversation.countDocuments({
        erxesApiId: conversationId,
      });

    const comments = await models.InstagramCommentConversation.find({
      erxesApiId: conversationId,
    });
    const comment_ids = comments?.map((item) => item.comment_id);

    const search = await models.InstagramCommentConversation.find({
      comment_id: { $in: comment_ids },
    });

    if (search.length > 0) {
      return {
        commentCount: commentCount,
        searchCount: search.length,
      };
    }

    return {
      commentCount: commentCount,
      searchCount: 0,
    };
  },

  async instagramGetPages(_root, args, { models }: IContext) {
    const { kind, accountId } = args;
    const account = await models.InstagramAccounts.getAccount({
      _id: accountId,
    });
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
    return models.InstagramCommentConversation.findOne({ _id });
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
    let messages: IInstagramConversationMessageDocument[] = [];
    const query = await buildSelector(conversationId, models.Conversations);
    if (conversation) {
      if (limit) {
        const sort: any = getFirst ? { createdAt: 1 } : { createdAt: -1 };

        messages = await models.InstagramConversationMessages.find(query)
          .sort(sort)
          .skip(skip || 0)
          .limit(limit);

        return getFirst ? messages : messages.reverse();
      }

      messages = await models.InstagramConversationMessages.find(query)
        .sort({ createdAt: -1 })
        .limit(50);

      return messages.reverse();
    } else {
      let comment: any[] = [];
      const sort: any = getFirst ? { createdAt: 1 } : { createdAt: -1 };
      comment = await models.InstagramCommentConversation.find({
        erxesApiId: conversationId,
      })
        .sort(sort)
        .skip(skip || 0);

      const comment_ids = comment?.map((item) => item.comment_id);
      const search = await models.InstagramCommentConversationReply.find({
        parentId: comment_ids,
      })
        .sort(sort)
        .skip(skip || 0);

      if (search.length > 0) {
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

    return models.InstagramConversationMessages.countDocuments(selector);
  },

  async instagramGetPost(
    _root,
    { erxesApiId }: IDetailParams,
    { models }: IContext,
  ) {
    const comment = await models.InstagramCommentConversation.findOne({
      erxesApiId: erxesApiId,
    });

    if (comment) {
      return await models.InstagramPostConversations.findOne({
        postId: comment.postId,
      });
    }

    return null;
  },
  async instagramGetBotPosts(_root, { botId }, { models }: IContext) {
    const bot = await models.InstagramBots.findOne({ _id: botId });

    if (!bot) {
      throw new Error('Bot not found');
    }

    return await fetchPagePosts(bot.pageId, bot.token);
  },

  async instagramGetPosts(
    _root,
    {
      brandIds,
      channelIds,
      limit = 20, // Default limit of 20 posts if not provided
    }: {
      brandIds: string | string[];
      channelIds: string | string[];
      limit?: number;
    },
    { models }: IContext,
  ) {
    const filteredBrandIds = Array.isArray(brandIds)
      ? brandIds.filter((id) => id !== '')
      : brandIds.split(',').filter((id) => id !== '');
    const filteredChannelIds = Array.isArray(channelIds)
      ? channelIds.filter((id) => id !== '')
      : channelIds.split(',').filter((id) => id !== '');

    const integrations: any[] = [];

    let response;
    if (filteredBrandIds.length > 0) {
      for (const BrandId of filteredBrandIds) {
        const splitBrandIds = BrandId.split(',');
        for (const brandId of splitBrandIds) {
          try {
            response = await models.InstagramIntegrations.find({
              kind: 'instagram-post',
              brandId: brandId,
            });
            integrations.push(...response);
          } catch (error) {
            throw new Error(
              `Error fetching Brand with ID ${brandId}: ${error.message}`,
            );
          }
        }
      }
    } else if (
      filteredChannelIds.length === 0 &&
      filteredBrandIds.length === 0
    ) {
      try {
        const response = await models.InstagramIntegrations.find({
          kind: 'instagram-post',
        });

        integrations.push(...response);
      } catch (error) {
        throw new Error(`Error fetching integrations: ${error.message}`);
      }
    }

    const channels: any[] = [];
    if (filteredChannelIds.length > 0) {
      for (const combinedChannelIds of filteredChannelIds) {
        const splitChannelIds = combinedChannelIds.split(',');

        for (const channelId of splitChannelIds) {
          try {
            const response = await models.Channels.find({
              _id: channelId,
            });
            integrations.push(...response);
          } catch (error) {
            throw new Error(
              `Error fetching channel with ID ${channelId}: ${error.message}`,
            );
          }
        }
      }
    }

    const channelIntegrationIds = channels.flatMap(
      (channel: any) => channel.integrationIds,
    );

    const allIntegrationIds = integrations.map(
      (integration: { _id: string }) => integration._id,
    );
    const uniqueIntegrationIds = [
      ...new Set([...allIntegrationIds, ...channelIntegrationIds]),
    ];

    const fetchedIntegrations = await models.InstagramIntegrations.find({
      erxesApiId: { $in: uniqueIntegrationIds },
    });

    if (fetchedIntegrations.length === 0) {
      throw new Error('No integrations found in the database');
    }

    const allPosts = await Promise.all(
      fetchedIntegrations.map(async (integration) => {
        const { instagramPageIds, facebookPageTokensMap } = integration;

        if (!instagramPageIds || instagramPageIds.length === 0) {
          return [];
        }

        if (
          !facebookPageTokensMap ||
          Object.keys(facebookPageTokensMap).length === 0
        ) {
          return [];
        }

        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        const fetchPagePostsWithRateLimiting = async (
          pageId,
          accessToken,
          limit,
        ) => {
          await delay(1000);
          return fetchPagesPostsList(pageId, accessToken, limit);
        };

        const posts = await Promise.all(
          instagramPageIds.map(async (pageId) => {
            const accessToken = facebookPageTokensMap[pageId];
            if (!accessToken) {
              console.warn(`Access token missing for page ID: ${pageId}`);
              return [];
            }
            return fetchPagePostsWithRateLimiting(pageId, accessToken, limit);
          }),
        );

        return posts.flat();
      }),
    );

    const allPostsFlattened = allPosts.flat();
    const limitedPosts = allPostsFlattened.slice(0, limit);

    return limitedPosts;
  },

  async instagramGetBotPost(_root, { botId, postId }, { models }: IContext) {
    const bot = await models.InstagramBots.findOne({ _id: botId });

    if (!bot) {
      throw new Error('Bot not found');
    }

    return await fetchPagePost(postId, bot.token);
  },

  async instagramHasTaggedMessages(
    _root,
    { conversationId }: IConversationId,
    { models }: IContext,
  ) {
    const inboxConversation = await models.InstagramConversations.findOne({
      _id: conversationId,
    });

    let integration;

    if (inboxConversation) {
      integration = await models.InstagramIntegrations.findOne({
        _id: inboxConversation.integrationId,
      });
    }

    if (integration && integration.kind !== INTEGRATION_KINDS.MESSENGER) {
      return false;
    }

    const query = await buildSelector(
      conversationId,
      models.InstagramConversations,
    );

    const messages = await models.InstagramConversationMessages.find({
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
    const query = await buildSelector(
      conversationId,
      models.InstagramPostConversations,
    );

    if (limit) {
      const sort: any = getFirst ? { createdAt: 1 } : { createdAt: -1 };

      messages = await models.InstagramCommentConversation.find(query)
        .sort(sort)
        .skip(skip || 0)
        .limit(limit);

      return getFirst ? messages : messages.reverse();
    }

    messages = await models.InstagramCommentConversation.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    return messages.reverse();
  },

  async instagramMessengerBotsTotalCount(_root, _args, { models }: IContext) {
    return await models.InstagramBots.find({}).countDocuments();
  },

  async instagramMessengerBots(_root, _args, { models }: IContext) {
    return await models.InstagramBots.find({});
  },

  async instagramMessengerBot(_root, { _id }, { models }: IContext) {
    return await models.InstagramBots.findOne({ _id });
  },
};
