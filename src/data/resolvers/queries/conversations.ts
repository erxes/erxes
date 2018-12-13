import { Brands, Channels, ConversationMessages, Conversations, Tags } from '../../../db/models';
import { IUserDocument } from '../../../db/models/definitions/users';

import { IMessageDocument } from '../../../db/models/definitions/conversationMessages';
import { CONVERSATION_STATUSES, INTEGRATION_KIND_CHOICES } from '../../constants';
import { moduleRequireLogin } from '../../permissions';
import QueryBuilder, { IListArgs } from './conversationQueryBuilder';

interface ICountBy {
  [index: string]: number;
}

interface IConversationRes {
  [index: string]: number | ICountBy;
}

// count helper
const count = async (query: any): Promise<number> => {
  const result = await Conversations.find(query).countDocuments();

  return Number(result);
};

const countByChannels = async (qb: any): Promise<ICountBy> => {
  const byChannels: ICountBy = {};
  const channels = await Channels.find();

  for (const channel of channels) {
    byChannels[channel._id] = await count({
      ...qb.mainQuery(),
      ...(await qb.channelFilter(channel._id)),
    });
  }

  return byChannels;
};

const countByIntegrationTypes = async (qb: any): Promise<ICountBy> => {
  const byIntegrationTypes: ICountBy = {};

  for (const intT of INTEGRATION_KIND_CHOICES.ALL) {
    byIntegrationTypes[intT] = await count({
      ...qb.mainQuery(),
      ...(await qb.integrationTypeFilter(intT)),
    });
  }

  return byIntegrationTypes;
};

const countByTags = async (qb: any): Promise<ICountBy> => {
  const byTags: ICountBy = {};
  const queries = qb.queries;
  const tags = await Tags.find();

  for (const tag of tags) {
    byTags[tag._id] = await count({
      ...qb.mainQuery(),
      ...queries.integrations,
      ...queries.integrationType,
      ...qb.tagFilter(tag._id),
    });
  }

  return byTags;
};

const countByBrands = async (qb: any): Promise<ICountBy> => {
  const byBrands: ICountBy = {};
  const brands = await Brands.find();

  for (const brand of brands) {
    byBrands[brand._id] = await count({
      ...qb.mainQuery(),
      ...qb.intersectIntegrationIds(qb.queries.channel, await qb.brandFilter(brand._id)),
    });
  }

  return byBrands;
};

const conversationQueries = {
  /**
   * Conversataions list
   */
  async conversations(_root, params: IListArgs, { user }: { user: IUserDocument }) {
    // filter by ids of conversations
    if (params && params.ids) {
      return Conversations.find({ _id: { $in: params.ids } }).sort({
        createdAt: -1,
      });
    }

    // initiate query builder
    const qb = new QueryBuilder(params, {
      _id: user._id,
      starredConversationIds: user.starredConversationIds,
    });

    await qb.buildAllQueries();

    return Conversations.find(qb.mainQuery())
      .sort({ updatedAt: -1 })
      .limit(params.limit || 0);
  },

  async conversationMessagesFacebook(_root, { conversationId, facebookCommentId, facebookPostId, limit }) {
    const query: { [key: string]: string | { [key: string]: string | boolean } } = { conversationId };
    const sort = { 'facebookData.isPost': -1, 'facebookData.createdTime': -1 };
    const result: { list: IMessageDocument[]; commentCount?: number } = {
      list: [],
    };

    const conversation = await Conversations.findOne({ _id: conversationId });

    if (!conversation || !conversation.facebookData) {
      throw new Error('Conversation not found');
    }

    // If there is no limit defined returning the feed post and the latest comment
    if (!limit) {
      limit = 2;
    }

    // Filter to retreive comment replies
    if (facebookCommentId) {
      query['facebookData.parentId'] = facebookCommentId;
      limit = 1000;
    }

    // Filter to retreive post comments
    if (facebookPostId) {
      query['facebookData.postId'] = facebookPostId;
      query['facebookData.parentId'] = { $exists: false };
    }

    result.list = await ConversationMessages.find(query)
      .sort(sort)
      .limit(limit);

    // If we received conversation via messenger returning unfiltered list
    if (conversation.facebookData.kind !== 'feed') {
      return result;
    }

    // Counting post comments only, excluding comment replies
    const commentCount = await ConversationMessages.find({
      conversationId: conversation._id,
      $and: [
        { 'facebookData.postId': conversation.facebookData.postId },
        { isPost: { $exists: false } },
        { 'facebookData.parentId': { $exists: false } },
      ],
    }).countDocuments();

    result.commentCount = commentCount;

    // Fetching the replies or comments
    if (facebookCommentId || facebookPostId) {
      return result;
    }

    // We are getting parent comment if the latest comment was reply
    const msgs = result.list;
    const lastItem = msgs[msgs.length - 1];

    if (lastItem.facebookData && lastItem.facebookData.parentId) {
      const parentComment = await ConversationMessages.findOne({
        'facebookData.commentId': lastItem.facebookData.parentId,
      });

      // inserting comment on top of reply
      if (parentComment) {
        result.list.splice(1, 0, parentComment);
      }
    }

    return result;
  },

  /**
   * Get conversation messages
   */
  async conversationMessages(
    _root,
    {
      conversationId,
      skip,
      limit,
    }: {
      conversationId: string;
      skip: number;
      limit: number;
    },
  ) {
    const query = { conversationId };

    if (limit) {
      const messages = await ConversationMessages.find(query)
        .sort({ createdAt: -1 })
        .skip(skip || 0)
        .limit(limit);

      return messages.reverse();
    }

    return ConversationMessages.find(query).sort({ createdAt: 1 });
  },

  /**
   *  Get all conversation messages count. We will use it in pager
   */
  async conversationMessagesTotalCount(_root, { conversationId }: { conversationId: string }) {
    return ConversationMessages.countDocuments({ conversationId });
  },

  /**
   * Group conversation counts by brands, channels, integrations, status
   */
  async conversationCounts(_root, params: IListArgs, { user }: { user: IUserDocument }) {
    const { only } = params;

    const response: IConversationRes = {};

    const qb = new QueryBuilder(params, {
      _id: user._id,
      starredConversationIds: user.starredConversationIds,
    });

    await qb.buildAllQueries();

    const queries = qb.queries;

    switch (only) {
      case 'byChannels':
        response.byChannels = await countByChannels(qb);
        break;

      case 'byIntegrationTypes':
        response.byIntegrationTypes = await countByIntegrationTypes(qb);
        break;

      case 'byBrands':
        response.byBrands = await countByBrands(qb);
        break;

      case 'byTags':
        response.byTags = await countByTags(qb);
        break;
    }

    // unassigned count
    response.unassigned = await count({
      ...qb.mainQuery(),
      ...queries.integrations,
      ...queries.integrationType,
      ...qb.unassignedFilter(),
    });

    // participating count
    response.participating = await count({
      ...qb.mainQuery(),
      ...queries.integrations,
      ...queries.integrationType,
      ...qb.participatingFilter(),
    });

    // starred count
    response.starred = await count({
      ...qb.mainQuery(),
      ...queries.integrations,
      ...queries.integrationType,
      ...qb.starredFilter(),
    });

    // resolved count
    response.resolved = await count({
      ...qb.mainQuery(),
      ...queries.integrations,
      ...queries.integrationType,
      ...qb.statusFilter(['closed']),
    });

    return response;
  },

  /**
   * Get one conversation
   */
  conversationDetail(_root, { _id }: { _id: string }) {
    return Conversations.findOne({ _id });
  },

  /**
   * Get all conversations count. We will use it in pager
   */
  async conversationsTotalCount(_root, params: IListArgs, { user }: { user: IUserDocument }) {
    // initiate query builder
    const qb = new QueryBuilder(params, {
      _id: user._id,
      starredConversationIds: user.starredConversationIds,
    });

    await qb.buildAllQueries();

    return Conversations.find(qb.mainQuery()).countDocuments();
  },

  /**
   * Get last conversation
   */
  async conversationsGetLast(_root, params: IListArgs, { user }: { user: IUserDocument }) {
    // initiate query builder
    const qb = new QueryBuilder(params, {
      _id: user._id,
      starredConversationIds: user.starredConversationIds,
    });

    await qb.buildAllQueries();

    return Conversations.findOne(qb.mainQuery()).sort({ updatedAt: -1 });
  },

  /**
   * Get all unread conversations for logged in user
   */
  async conversationsTotalUnreadCount(_root, _args, { user }: { user: IUserDocument }) {
    // initiate query builder
    const qb = new QueryBuilder({}, { _id: user._id });

    // get all possible integration ids
    const integrationsFilter = await qb.integrationsFilter();

    return Conversations.find({
      ...integrationsFilter,
      status: { $in: [CONVERSATION_STATUSES.NEW, CONVERSATION_STATUSES.OPEN] },
      readUserIds: { $ne: user._id },

      // exclude engage messages if customer did not reply
      $or: [
        {
          userId: { $exists: true },
          messageCount: { $gt: 1 },
        },
        {
          userId: { $exists: false },
        },
      ],
    }).countDocuments();
  },
};

moduleRequireLogin(conversationQueries);

export default conversationQueries;
