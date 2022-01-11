import { ConversationMessages, Conversations } from '../../models';
import { CONVERSATION_STATUSES } from '../../models/definitions/constants';
import { IMessageDocument } from '../../models/definitions/conversationMessages';
import { countByConversations } from '../../conversationUtils';

import {
  checkPermission,
  moduleRequireLogin
} from '@erxes/api-utils/src/permissions';

import { IContext } from '@erxes/api-utils';
import QueryBuilder, { IListArgs } from '../../conversationQueryBuilder';

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

const conversationQueries = {
  /**
   * Conversations list
   */
  async conversations(_root, params: IListArgs, { user }: IContext) {
    // filter by ids of conversations
    if (params && params.ids) {
      return Conversations.find({ _id: { $in: params.ids } }).sort({
        updatedAt: -1
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
    const _user = {
      _id: user._id,
      code: user.code,
      starredConversationIds: user.starredConversationIds
    };

    const qb = new QueryBuilder(params, _user);

    await qb.buildAllQueries();

    const queries = qb.queries;
    const integrationIds = queries.integrations.integrationId.$in;

    if (only) {
      response[only] = await countByConversations(
        params,
        integrationIds,
        _user,
        only
      );
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

    return Conversations.findOne(qb.mainQuery())
      .sort({ updatedAt: -1 })
      .lean();
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
      $and: [{ $or: qb.userRelevanceQuery() }]
    }).countDocuments();
  }
};

moduleRequireLogin(conversationQueries);

checkPermission(conversationQueries, 'conversations', 'showConversations', []);

export default conversationQueries;