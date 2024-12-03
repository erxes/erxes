import { IContext, IModels } from "../../connectionResolver";
import { INTEGRATION_KINDS } from "../../constants";
import { sendInboxMessage } from "../../messageBroker";
import { IConversationMessageDocument } from "../../models/definitions/conversationMessages";

import {
  fetchPagePost,
  fetchPagePosts,
  getPageList,
  graphRequest,
  fetchPagesPostsList,
  getProfile
} from "../../utils";
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
  const query = { conversationId: "" };

  const conversation = await model.findOne({
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

  async instagramGetIntegrationDetail(
    _root,
    { erxesApiId }: IDetailParams,
    { models }: IContext
  ) {
    return models.Integrations.findOne({ erxesApiId });
  },

  async instagramGetConfigs(_root, _args, { models }: IContext) {
    return models.Configs.find({}).lean();
  },

  async instagramGetComments(
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
    const post = await models.PostConversations.findOne({
      erxesApiId: conversationId
    });

    const query: {
      postId: string;
      isResolved?: boolean;
      parentId?: string;
      senderId?: string;
    } = {
      postId: post ? post.postId || "" : "",
      isResolved: isResolved === true
    };

    if (senderId && senderId !== "undefined") {
      const customer = await models.Customers.findOne({ erxesApiId: senderId });

      if (customer && customer.userId) {
        query.senderId = customer.userId;
      }
    } else {
      query.parentId = commentId !== "undefined" ? commentId : "";
    }

    const result = await models.CommentConversation.aggregate([
      {
        $match: query
      },
      {
        $lookup: {
          from: "customers_instagrams",
          localField: "senderId",
          foreignField: "userId",
          as: "customer"
        }
      },
      {
        $unwind: {
          path: "$customer",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "posts_conversations_instagrams",
          localField: "postId",
          foreignField: "postId",
          as: "post"
        }
      },
      {
        $unwind: {
          path: "$post",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "comments_instagrams",
          localField: "commentId",
          foreignField: "parentId",
          as: "replies"
        }
      },
      {
        $addFields: {
          commentCount: { $size: "$replies" },
          "customer.avatar": "$customer.profilePic",
          "customer._id": "$customer.erxesApiId",
          conversationId: "$post.erxesApiId"
        }
      },

      { $sort: { timestamp: -1 } },
      { $limit: limit }
    ]);

    return result.reverse();
  },

  async instagramGetCommentCount(_root, args, { models }: IContext) {
    const { conversationId, isResolved = false } = args;

    const commentCount = await models.CommentConversation.countDocuments({
      erxesApiId: conversationId
    });

    const comments = await models.CommentConversation.find({
      erxesApiId: conversationId
    });
    const comment_ids = comments?.map((item) => item.comment_id);

    const search = await models.CommentConversation.find({
      comment_id: { $in: comment_ids }
    });

    if (search.length > 0) {
      return {
        commentCount: commentCount,
        searchCount: search.length
      };
    }

    return {
      commentCount: commentCount,
      searchCount: 0
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
      if (!e.message.includes("Application request limit reached")) {
        await models.Integrations.updateOne(
          { accountId },
          { $set: { healthStatus: "account-token", error: `${e.message}` } }
        );
      }
    }

    return pages;
  },

  async instagramConversationDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext
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
    { models }: IContext
  ) {
    const { conversationId, limit, skip, getFirst } = args;

    const conversation = await models.Conversations.findOne({
      erxesApiId: conversationId
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
        erxesApiId: conversationId
      })
        .sort(sort)
        .skip(skip || 0);

      const comment_ids = comment?.map((item) => item.comment_id);
      const search = await models.CommentConversationReply.find({
        parentId: comment_ids
      })
        .sort(sort)
        .skip(skip || 0);

      if (search.length > 0) {
        return [...comment, ...search].sort((a, b) =>
          a.createdAt > b.createdAt ? 1 : -1
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
    { models }: IContext
  ) {
    const selector = await buildSelector(conversationId, models.Conversations);

    return models.ConversationMessages.countDocuments(selector);
  },

  async instagramGetPost(
    _root,
    { erxesApiId }: IDetailParams,
    { models }: IContext
  ) {
    const comment = await models.CommentConversation.findOne({
      erxesApiId: erxesApiId
    });

    if (comment) {
      return await models.PostConversations.findOne({
        postId: comment.postId
      });
    }

    return null;
  },
  async instagramGetBotPosts(_root, { botId }, { models }: IContext) {
    const bot = await models.Bots.findOne({ _id: botId });

    if (!bot) {
      throw new Error("Bot not found");
    }

    return await fetchPagePosts(bot.pageId, bot.token);
  },

  async instagramGetPosts(
    _root,
    {
      brandIds,
      channelIds,
      limit = 20 // Default limit of 20 posts if not provided
    }: {
      brandIds: string | string[];
      channelIds: string | string[];
      limit?: number;
    },
    { models, subdomain }: IContext
  ) {
    const filteredBrandIds = Array.isArray(brandIds)
      ? brandIds.filter((id) => id !== "")
      : brandIds.split(",").filter((id) => id !== "");
    const filteredChannelIds = Array.isArray(channelIds)
      ? channelIds.filter((id) => id !== "")
      : channelIds.split(",").filter((id) => id !== "");

    let integrations: any[] = [];

    let response;
    if (filteredBrandIds.length > 0) {
      for (const BrandId of filteredBrandIds) {
        const splitBrandIds = BrandId.split(",");
        for (const brandId of splitBrandIds) {
          try {
            response = await sendInboxMessage({
              subdomain,
              action: "integrations.find",
              data: {
                query: { kind: "instagram-post", brandId: brandId }
              },
              isRPC: true,
              defaultValue: []
            });

            if (Array.isArray(response)) {
              integrations.push(...response);
            } else {
              integrations.push(response);
            }
          } catch (error) {
            throw new Error(
              `Error fetching Brand with ID ${brandId}: ${error.message}`
            );
          }
        }
      }
    } else if (
      filteredChannelIds.length === 0 &&
      filteredBrandIds.length === 0
    ) {
      response = await sendInboxMessage({
        subdomain,
        action: "integrations.find",
        data: {
          query: { kind: "instagram-post" }
        },
        isRPC: true,
        defaultValue: []
      });
      if (Array.isArray(response)) {
        integrations.push(...response);
      } else {
        integrations.push(response);
      }
    }

    let channels: any[] = [];
    if (filteredChannelIds.length > 0) {
      for (const combinedChannelIds of filteredChannelIds) {
        const splitChannelIds = combinedChannelIds.split(",");

        for (const channelId of splitChannelIds) {
          try {
            const response = await sendInboxMessage({
              subdomain,
              action: "channels.find",
              data: { _id: channelId },
              isRPC: true,
              defaultValue: []
            });
            if (Array.isArray(response)) {
              channels.push(...response);
            } else {
              channels.push(response);
            }
          } catch (error) {
            throw new Error(
              `Error fetching channel with ID ${channelId}: ${error.message}`
            );
          }
        }
      }
    }

    const channelIntegrationIds = channels.flatMap(
      (channel: any) => channel.integrationIds
    );

    const allIntegrationIds = integrations.map(
      (integration: { _id: string }) => integration._id
    );
    const uniqueIntegrationIds = [
      ...new Set([...allIntegrationIds, ...channelIntegrationIds])
    ];

    const fetchedIntegrations = await models.Integrations.find({
      erxesApiId: { $in: uniqueIntegrationIds }
    });

    if (fetchedIntegrations.length === 0) {
      throw new Error("No integrations found in the database");
    }

    const allPosts = await Promise.all(
      fetchedIntegrations.map(async (integration) => {
        const { instagramPageId, facebookPageTokensMap } = integration;

        if (!instagramPageId || instagramPageId.length === 0) {
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
          limit
        ) => {
          await delay(1000);
          return fetchPagesPostsList(pageId, accessToken, limit);
        };

        return "success";
      })
    );

    const allPostsFlattened = allPosts.flat();
    const limitedPosts = allPostsFlattened.slice(0, limit);

    return limitedPosts;
  },

  async instagramGetBotPost(_root, { botId, postId }, { models }: IContext) {
    const bot = await models.Bots.findOne({ _id: botId });

    if (!bot) {
      throw new Error("Bot not found");
    }

    return await fetchPagePost(postId, bot.token);
  },

  async instagramGetBotAds(_root, { botId }, { models }: IContext) {
    const bot = await models.Bots.findOne({ _id: botId });

    if (!bot) {
      throw new Error("Bot not found");
    }

    const adAccounts = await graphRequest.get(
      `${bot.uid}/adaccounts?access_token=${bot.token}`
    );

    const adAccountId = adAccounts?.data[0]?.id;

    if (!adAccountId) {
      throw new Error("Something went wrong during fetch ads");
    }

    const { data } = await graphRequest.get(
      `${adAccountId}/adsets?fields=id,name,adcreatives{thumbnail_url},ads{id}&access_token=${bot.token}`
    );

    return data.map((data) => ({
      _id: data?.ads?.data[0]?.id,
      name: data.name,
      thumbnail: data?.adcreatives?.data[0]?.thumbnail_url
    }));
  },

  async igbootMessengerBots(_root, _args, { models }: IContext) {
    try {
      const bots = await models.Bots.find({});
      const result = await Promise.all(
        bots.map(async (bot) => {
          // Define accountData with a proper union type
          let accountData: { _id: string; name: string } | null = null;
          let page: { id: string; name: string } | null = null;
          let getPage: any = null;

          const ig_account = await models.Accounts.getAccount({
            _id: bot.accountId
          }).catch(() => null);

          if (ig_account) {
            const accessToken = ig_account.token;

            accountData = {
              _id: ig_account._id as string,
              name: ig_account.name
            };

            getPage = await getProfile(bot.pageId, accessToken).catch(
              () => null
            );

            if (getPage?.id) {
              page = {
                id: getPage.id,
                name: getPage.username
              };
            }
          }

          return {
            _id: bot._id,
            name: bot.name,
            accountId: bot.accountId,
            account: accountData,
            page,
            pageId: bot.pageId,
            profileUrl: getPage?.profile_picture_url || "",
            persistentMenus: bot.persistentMenus || [],
            greetText: bot.greetText || "",
            tag: bot.tag || "",
            isEnabledBackBtn: bot.isEnabledBackBtn || false,
            backButtonText: bot.backButtonText || ""
          };
        })
      );

      return result;
    } catch (error) {
      console.error("Error fetching Instagram Messenger Bots data:", error);
      throw new Error("Failed to fetch Instagram Messenger Bots data.");
    }
  },
  async igbootMessengerBotsTotalCount(_root, _args, { models }: IContext) {
    return await models.Bots.find({}).countDocuments();
  },

  async igbootMessengerBot(_root, { _id }, { models }: IContext) {
    return await models.Bots.findOne({ _id });
  },
  async instagramHasTaggedMessages(
    _root,
    { conversationId }: IConversationId,
    { models, subdomain }: IContext
  ) {
    const commonParams = { isRPC: true, subdomain };
    const inboxConversation = await sendInboxMessage({
      ...commonParams,
      action: "conversations.findOne",
      data: { query: { _id: conversationId } }
    });

    let integration;

    if (inboxConversation) {
      integration = await sendInboxMessage({
        ...commonParams,
        action: "integrations.findOne",
        data: { _id: inboxConversation.integrationId }
      });
    }

    if (integration && integration.kind !== INTEGRATION_KINDS.MESSENGER) {
      return false;
    }

    const query = await buildSelector(conversationId, models.Conversations);

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
  },

  async instagramPostMessages(
    _root,
    args: IMessagesParams,
    { models }: IContext
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
  }
};

export default instagramQueries;
