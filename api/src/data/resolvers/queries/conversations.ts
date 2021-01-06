import {
  Brands,
  Channels,
  ConversationMessages,
  Conversations,
  Tags
} from '../../../db/models';
import {
  CONVERSATION_STATUSES,
  KIND_CHOICES
} from '../../../db/models/definitions/constants';
import { IMessageDocument } from '../../../db/models/definitions/conversationMessages';
import {
  checkPermission,
  moduleRequireLogin
} from '../../permissions/wrappers';
import { IContext } from '../../types';
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
      ...(await qb.channelFilter(channel._id))
    });
  }

  return byChannels;
};

const countByIntegrationTypes = async (qb: any): Promise<ICountBy> => {
  const byIntegrationTypes: ICountBy = {};

  for (const intT of KIND_CHOICES.ALL) {
    byIntegrationTypes[intT] = await count({
      ...qb.mainQuery(),
      ...(await qb.extendedQueryFilter({ integrationType: intT }))
    });
  }

  return byIntegrationTypes;
};

const countByTags = async (qb: any): Promise<ICountBy> => {
  const byTags: ICountBy = {};
  const queries = qb.queries;
  const tags = await Tags.find();

  const tagQueries = {
    ...qb.mainQuery(),
    ...queries.integrations,
    ...queries.extended
  };

  for (const tag of tags) {
    byTags[tag._id] = await count({
      ...tagQueries,
      ...qb.tagFilter(tag._id)
    });
  }

  return byTags;
};

const countByBrands = async (qb: any): Promise<ICountBy> => {
  const byBrands: ICountBy = {};
  const brands = await Brands.find();

  for (const brand of brands) {
    const brandQuery = await qb.brandFilter(brand._id);

    byBrands[brand._id] = brandQuery
      ? await count({
          ...qb.mainQuery(),
          ...(await qb.intersectIntegrationIds(
            qb.queries.integrations,
            brandQuery
          ))
        })
      : 0;
  }

  return byBrands;
};

const conversationQueries = {
  /**
   * Conversations list
   */
  async conversations(_root, params: IListArgs, { user }: IContext) {
    // filter by ids of conversations
    if (params && params.ids) {
      return Conversations.find({ _id: { $in: params.ids } }).sort({
        createdAt: -1
      });
    }

    // initiate query builder
    const qb = new QueryBuilder(params, {
      _id: user._id,
      code: user.code,
      starredConversationIds: user.starredConversationIds
    });

    await qb.buildAllQueries();

    return Conversations.find(qb.mainQuery())
      .sort({ updatedAt: -1 })
      .limit(params.limit || 0);
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
      getFirst
    }: {
      conversationId: string;
      skip: number;
      limit: number;
      getFirst: boolean;
    }
  ) {
    const query = { conversationId };

    let messages: IMessageDocument[] = [];

    if (limit) {
      const sort = getFirst ? { createdAt: 1 } : { createdAt: -1 };

      messages = await ConversationMessages.find(query)
        .sort(sort)
        .skip(skip || 0)
        .limit(limit);

      return getFirst ? messages : messages.reverse();
    }

    messages = await ConversationMessages.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    return messages.reverse();
  },

  /**
   *  Get all conversation messages count. We will use it in pager
   */
  async conversationMessagesTotalCount(
    _root,
    { conversationId }: { conversationId: string }
  ) {
    return ConversationMessages.countDocuments({ conversationId });
  },

  async converstationFacebookComments(
    _root,
    {
      postId,
      isResolved,
      commentId,
      limit,
      senderId
    }: {
      commentId: string;
      isResolved: string;
      postId: string;
      senderId: string;
      limit: number;
    },
    { dataSources }: IContext
  ) {
    return dataSources.IntegrationsAPI.fetchApi('/facebook/get-comments', {
      postId,
      isResolved,
      commentId,
      senderId,
      limit: limit || 10
    });
  },

  async converstationFacebookCommentsCount(
    _root,
    { postId, isResolved }: { postId: string; isResolved: string },
    { dataSources }: IContext
  ) {
    return dataSources.IntegrationsAPI.fetchApi(
      '/facebook/get-comments-count',
      {
        postId,
        isResolved
      }
    );
  },
  /**
   * Group conversation counts by brands, channels, integrations, status
   */
  async conversationCounts(_root, params: IListArgs, { user }: IContext) {
    const { only } = params;

    const response: IConversationRes = {};

    const qb = new QueryBuilder(params, {
      _id: user._id,
      code: user.code,
      starredConversationIds: user.starredConversationIds
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

    const mainQuery = {
      ...qb.mainQuery(),
      ...queries.integrations,
      ...queries.extended
    };

    // unassigned count
    response.unassigned = await count({
      ...mainQuery,
      ...qb.unassignedFilter()
    });

    // participating count
    response.participating = await count({
      ...mainQuery,
      ...qb.participatingFilter()
    });

    // starred count
    response.starred = await count({
      ...mainQuery,
      ...qb.starredFilter()
    });

    // resolved count
    response.resolved = await count({
      ...mainQuery,
      ...qb.statusFilter(['closed'])
    });

    // awaiting response count
    response.awaitingResponse = await count({
      ...mainQuery,
      ...qb.awaitingResponse()
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
  async conversationsTotalCount(_root, params: IListArgs, { user }: IContext) {
    // initiate query builder
    const qb = new QueryBuilder(params, {
      _id: user._id,
      code: user.code,
      starredConversationIds: user.starredConversationIds
    });

    await qb.buildAllQueries();

    return Conversations.find(qb.mainQuery()).countDocuments();
  },

  /**
   * Get last conversation
   */
  async conversationsGetLast(_root, params: IListArgs, { user }: IContext) {
    // initiate query builder
    const qb = new QueryBuilder(params, {
      _id: user._id,
      code: user.code,
      starredConversationIds: user.starredConversationIds
    });

    await qb.buildAllQueries();

    return Conversations.findOne(qb.mainQuery()).sort({ updatedAt: -1 });
  },

  /**
   * Get all unread conversations for logged in user
   */
  async conversationsTotalUnreadCount(_root, _args, { user }: IContext) {
    // initiate query builder
    const qb = new QueryBuilder({}, { _id: user._id, code: user.code });

    await qb.buildAllQueries();

    // get all possible integration ids
    const integrationsFilter = await qb.integrationsFilter();

    return Conversations.find({
      ...integrationsFilter,
      status: { $in: [CONVERSATION_STATUSES.NEW, CONVERSATION_STATUSES.OPEN] },
      readUserIds: { $ne: user._id },
      $and: [{ $or: qb.defaultUserQuery() }, { $or: qb.userRelevanceQuery() }]
    }).countDocuments();
  }
};

moduleRequireLogin(conversationQueries);

checkPermission(conversationQueries, 'conversations', 'showConversations', []);

export default conversationQueries;
