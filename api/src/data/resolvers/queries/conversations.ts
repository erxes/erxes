import { ConversationMessages, Conversations } from '../../../db/models';
import { CONVERSATION_STATUSES } from '../../../db/models/definitions/constants';
import { IMessageDocument } from '../../../db/models/definitions/conversationMessages';
import { countByConversations } from '../../modules/conversations/utils';
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

    const aggregationPipeline = [
      {
        $facet: {
          unassigned: [
            { $match: { ...mainQuery, ...qb.unassignedFilter() } },
            { $count: 'count' }
          ],
          participating: [
            { $match: { ...mainQuery, ...qb.participatingFilter() } },
            { $count: 'count' }
          ],
          starred: [
            { $match: { ...mainQuery, ...qb.starredFilter() } },
            { $count: 'count' }
          ],
          resolved: [
            { $match: { ...mainQuery, ...qb.statusFilter(['closed']) } },
            { $count: 'count' }
          ],
          awaitingResponse: [
            { $match: { ...mainQuery, ...qb.awaitingResponse() } },
            { $count: 'count' }
          ]
        }
      },
      {
        $project: {
          unassigned: { $arrayElemAt: ['$unassigned.count', 0] },
          participating: { $arrayElemAt: ['$participating.count', 0] },
          starred: { $arrayElemAt: ['$starred.count', 0] },
          resolved: { $arrayElemAt: ['$resolved.count', 0] },
          awaitingResponse: { $arrayElemAt: ['$awaitingResponse.count', 0] }
        }
      }
    ];

    const result = await Conversations.aggregate(aggregationPipeline);

    response.unassigned = (result[0] || {}).unassigned || 0;
    response.participating = (result[0] || {}).participating || 0;
    response.starred = (result[0] || {}).starred || 0;
    response.resolved = (result[0] || {}).resolved || 0;
    response.awaitingResponse = (result[0] || {}).awaitingResponse || 0;

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
      $and: [{ $or: qb.userRelevanceQuery() }]
    }).countDocuments();
  }
};

moduleRequireLogin(conversationQueries);

checkPermission(conversationQueries, 'conversations', 'showConversations', []);

export default conversationQueries;
