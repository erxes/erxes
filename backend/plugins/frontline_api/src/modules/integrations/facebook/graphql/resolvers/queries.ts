import { IContext } from '~/connectionResolvers';
import {
  getPageList,
  fetchPagesPostsList,
  fetchPagePosts,
  fetchPagePost,
} from '@/integrations/facebook/utils';
import {
  IKind,
  IDetailParams,
  ICommentsParams,
  IMessagesParams,
  IConversationId,
} from '@/integrations/facebook/@types/utils';
import { IFacebookConversationMessageDocument } from '@/integrations/facebook/@types/conversationMessages';
import { INTEGRATION_KINDS } from '@/integrations/facebook/constants';

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

export const facebookQueries = {
  async facebookGetConfigs(_root, _args, { models }: IContext) {
    return await models.FacebookConfigs.find({});
  },
  async facebookGetAccounts(_root, { kind }: IKind, { models }: IContext) {
    return models.FacebookAccounts.find({ kind });
  },

  async facebookGetIntegrations(_root, { kind }: IKind, { models }: IContext) {
    return models.FacebookIntegrations.find({ kind });
  },

  async facebookGetIntegrationDetail(
    _root,
    { erxesApiId }: IDetailParams,
    { models }: IContext,
  ) {
    return models.FacebookIntegrations.findOne({ erxesApiId });
  },

  async facebookGetComments(
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
    const post = await models.FacebookPostConversations.findOne({
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
      const customer = await models.FacebookCustomers.findOne({
        erxesApiId: senderId,
      });

      if (customer && customer.userId) {
        query.senderId = customer.userId;
      }
    } else {
      query.parentId = commentId !== 'undefined' ? commentId : '';
    }

    const result = await models.FacebookCommentConversation.aggregate([
      {
        $match: query,
      },
      {
        $lookup: {
          from: 'customers_facebooks',
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
          from: 'posts_conversations_facebooks',
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
          from: 'comments_facebooks',
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

  async facebookGetCommentCount(_root, args, { models }: IContext) {
    const { conversationId } = args;

    const commentCount =
      await models.FacebookCommentConversation.countDocuments({
        erxesApiId: conversationId,
      });

    const comments = await models.FacebookCommentConversation.find({
      erxesApiId: conversationId,
    });
    // Extracting comment_ids from the comments array
    const comment_ids = comments?.map((item) => item.comment_id);

    // Using the extracted comment_ids to search for matching comments
    const search = await models.FacebookCommentConversation.find({
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

  async facebookGetPages(_root, args, { models }: IContext) {
    const { kind, accountId } = args;
    const account = await models.FacebookAccounts.getAccount({
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

  async facebookConversationDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    const conversation = await models.FacebookConversations.findOne({ _id });
    if (conversation) {
      return conversation;
    }
    return await models.FacebookCommentConversation.findOne({ _id });
  },

  async facebookConversationMessages(
    _root,
    args: IMessagesParams,
    { models }: IContext,
  ) {
    const { conversationId, limit, skip, getFirst } = args;

    const conversation = await models.FacebookConversations.findOne({
      erxesApiId: conversationId,
    });
    let messages: IFacebookConversationMessageDocument[] = [];
    const query = await buildSelector(
      conversationId,
      models.FacebookConversations,
    );
    if (conversation) {
      if (limit) {
        const sort: any = getFirst ? { createdAt: 1 } : { createdAt: -1 };

        messages = await models.FacebookConversationMessages.find(query)
          .sort(sort)
          .skip(skip || 0)
          .limit(limit);

        return getFirst ? messages : messages.reverse();
      }

      messages = await models.FacebookConversationMessages.find(query)
        .sort({ createdAt: -1 })
        .limit(50);

      return messages.reverse();
    } else {
      let comment: any[] = [];
      const sort: any = getFirst ? { createdAt: 1 } : { createdAt: -1 };
      comment = await models.FacebookCommentConversation.find({
        erxesApiId: conversationId,
      })
        .sort(sort)
        .skip(skip || 0);

      const comment_ids = comment?.map((item) => item.comment_id);
      const search = await models.FacebookCommentConversationReply.find({
        parentId: comment_ids,
      })
        .sort(sort)
        .skip(skip || 0);

      if (search.length > 0) {
        // Combine the arrays and sort by createdAt in ascending order
        const combinedResult = [...comment, ...search].sort((a, b) =>
          a.createdAt > b.createdAt ? 1 : -1,
        );
        return combinedResult;
      } else {
        return comment;
      }
    }
  },
  /**
   *  Get all conversation messages count. We will use it in pager
   */
  async facebookConversationMessagesCount(
    _root,
    { conversationId }: { conversationId: string },
    { models }: IContext,
  ) {
    const selector = await buildSelector(
      conversationId,
      models.FacebookConversations,
    );

    return models.FacebookConversationMessages.countDocuments(selector);
  },

  async facebookGetPost(
    _root,
    { erxesApiId }: IDetailParams,
    { models }: IContext,
  ) {
    const comment = await models.FacebookCommentConversation.findOne({
      erxesApiId: erxesApiId,
    });
    if (comment) {
      const postConversation = await models.FacebookPostConversations.findOne({
        postId: comment.postId,
      });
      return postConversation; // Return the postConversation when comment is found
    }

    // Return null or some appropriate value when comment is not found
    return null;
  },

  async facebookGetPosts(
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
            response = await models.FacebookIntegrations.find({
              kind: 'facebook-post',
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
        const response = await models.FacebookIntegrations.find({
          kind: 'facebook-post',
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

    const fetchedIntegrations = await models.FacebookIntegrations.find({
      erxesApiId: { $in: uniqueIntegrationIds },
    });

    if (fetchedIntegrations.length === 0) {
      throw new Error('No integrations found in the database');
    }

    const allPosts = await Promise.all(
      fetchedIntegrations.map(async (integration) => {
        const { facebookPageIds, facebookPageTokensMap } = integration;

        if (!facebookPageIds || facebookPageIds.length === 0) {
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
          facebookPageIds.map(async (pageId) => {
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

    // Applying the limit to the final result
    const allPostsFlattened = allPosts.flat();
    const limitedPosts = allPostsFlattened.slice(0, limit);

    return limitedPosts;
  },

  async facebookHasTaggedMessages(
    _root,
    { conversationId }: IConversationId,
    { models, subdomain }: IContext,
  ) {
    const inboxConversation = await models.FacebookConversations.findOne({
      _id: conversationId,
    });

    let integration;

    if (inboxConversation) {
      integration = await models.FacebookIntegrations.findOne({
        _id: inboxConversation.integrationId,
      });
    }

    if (integration && integration.kind !== INTEGRATION_KINDS.MESSENGER) {
      return false;
    }

    const query = await buildSelector(
      conversationId,
      models.FacebookConversations,
    );

    const messages = await models.FacebookConversationMessages.find({
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

  async facebookPostMessages(
    _root,
    args: IMessagesParams,
    { models }: IContext,
  ) {
    const { conversationId, limit, skip, getFirst } = args;
    let messages: any[] = [];
    const query = await buildSelector(
      conversationId,
      models.FacebookPostConversations,
    );

    if (limit) {
      const sort: any = getFirst ? { createdAt: 1 } : { createdAt: -1 };

      messages = await models.FacebookCommentConversation.find(query)
        .sort(sort)
        .skip(skip || 0)
        .limit(limit);

      return getFirst ? messages : messages.reverse();
    }

    messages = await models.FacebookCommentConversation.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    return messages.reverse();
  },

  async facebookMessengerBotsTotalCount(_root, _args, { models }: IContext) {
    return await models.FacebookBots.find({}).countDocuments();
  },

  async facebookMessengerBots(_root, _args, { models }: IContext) {
    return await models.FacebookBots.find({});
  },

  async facebookMessengerBot(_root, { _id }, { models }: IContext) {
    return await models.FacebookBots.findOne({ _id });
  },

  async facebookGetBotPosts(_root, { botId }, { models }: IContext) {
    const bot = await models.FacebookBots.findOne({ _id: botId });

    if (!bot) {
      throw new Error('Bot not found');
    }

    return await fetchPagesPostsList(bot.pageId, bot.token, 20);
  },
  async facebookGetBotPost(_root, { botId, postId }, { models }: IContext) {
    const bot = await models.FacebookBots.findOne({ _id: botId });

    if (!bot) {
      throw new Error('Bot not found');
    }

    return await fetchPagePost(postId, bot.token);
  },
};
