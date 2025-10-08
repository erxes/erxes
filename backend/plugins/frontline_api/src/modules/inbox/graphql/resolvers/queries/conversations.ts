import { IContext, IModels } from '~/connectionResolvers';
import QueryBuilder, { IListArgs } from '~/conversationQueryBuilder';
import { CONVERSATION_STATUSES } from '~/modules/inbox/db/definitions/constants';
import { cursorPaginate } from 'erxes-api-shared/utils';
import {
  IConversationDocument,
  IConversationListParams,
} from '~/modules/inbox/@types/conversations';
import { IMessageDocument } from '~/modules/inbox/@types/conversationMessages';
import { countByConversations } from '~/modules/inbox/conversationUtils';
import { IConversationRes } from '~/modules/inbox/@types/conversations';
// count helper
const count = async (models: IModels, query: any): Promise<number> => {
  const result = await models.Conversations.countDocuments(query);
  return Number(result);
};
export const conversationQueries = {
  /**
   * Conversations list
   */
  async conversations(
    _parent: undefined,
    params: IConversationListParams,
    { user, models, subdomain }: IContext,
  ) {
    if (params && params.ids) {
      const { list, totalCount, pageInfo } =
        await cursorPaginate<IConversationDocument>({
          model: models.Conversations,
          params: {
            ...params,
            orderBy: { updatedAt: -1 }, // Optional, _id is used as a fallback
          },
          query: { _id: { $in: params.ids } },
        });

      return { list, totalCount, pageInfo };
    }

    const qb = new QueryBuilder(models, subdomain, params, {
      _id: user._id,
      code: user.code,
      starredConversationIds: user.starredConversationIds,
      role: user.role,
    });

    await qb.buildAllQueries();

    const { list, totalCount, pageInfo } =
      await cursorPaginate<IConversationDocument>({
        model: models.Conversations,
        params: {
          ...params,
          orderBy: { createdAt: -1 },
          limit: params.limit || 20,
        },
        query: qb.mainQuery(),
      });

    return { list, totalCount, pageInfo };
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
      getFirst,
    }: {
      conversationId: string;
      skip: number;
      limit: number;
      getFirst: boolean;
    },
    { models }: IContext,
  ) {
    const query = { conversationId };

    let messages: IMessageDocument[] = [];

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
  },

  /**
   *  Get all conversation messages count. We will use it in pager
   */
  async conversationMessagesTotalCount(
    _root,
    { conversationId }: { conversationId: string },
    { models }: IContext,
  ) {
    return models.ConversationMessages.countDocuments({ conversationId });
  },

  /**
   * Group conversation counts by brands, channels, integrations, status
   */
  async conversationCounts(
    _root,
    params: IListArgs,
    { user, models, subdomain }: IContext,
  ) {
    const { only } = params;

    const response: IConversationRes = {};
    const _user = {
      _id: user._id,
      code: user.code,
      starredConversationIds: user.starredConversationIds,
      role: user.role,
    };

    const qb = new QueryBuilder(models, subdomain, params, _user);

    await qb.buildAllQueries();

    const queries = qb.queries;
    const integrationIds = queries.integrations.integrationId.$in;

    if (only) {
      response[only] = await countByConversations(
        models,
        subdomain,
        params,
        integrationIds,
        _user,
        only,
      );
    }

    const mainQuery = {
      ...qb.mainQuery(),
      ...queries.integrations,
      ...queries.extended,
    };

    // unassigned count
    response.unassigned = await count(models, {
      ...mainQuery,
      ...qb.unassignedFilter(),
    });

    // participating count
    response.participating = await count(models, {
      ...mainQuery,
      ...qb.participatingFilter(),
    });

    // starred count
    response.starred = await count(models, {
      ...mainQuery,
      ...qb.starredFilter(),
    });

    // resolved count
    response.resolved = await count(models, {
      ...mainQuery,
      ...qb.statusFilter(['closed']),
    });

    // awaiting response count
    response.awaitingResponse = await count(models, {
      ...mainQuery,
      ...qb.awaitingResponse(),
    });

    return response;
  },

  /**
   * Get one conversation
   */
  async conversationDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.Conversations.findOne({ _id });
  },

  /**
   * Get all conversations count. We will use it in pager
   */
  async conversationsTotalCount(
    _root,
    params: IListArgs,
    { user, models, subdomain }: IContext,
  ) {
    // initiate query builder
    const qb = new QueryBuilder(models, subdomain, params, {
      _id: user._id,
      code: user.code,
      starredConversationIds: user.starredConversationIds,
    });

    await qb.buildAllQueries();

    return models.Conversations.find(qb.mainQuery()).countDocuments();
  },

  /**
   * Get last conversation
   */
  async conversationsGetLast(
    _root,
    params: IListArgs,
    { user, models, subdomain }: IContext,
  ) {
    // initiate query builder
    const qb = new QueryBuilder(models, subdomain, params, {
      _id: user._id,
      code: user.code,
      starredConversationIds: user.starredConversationIds,
    });

    await qb.buildAllQueries();

    return models.Conversations.findOne(qb.mainQuery())
      .sort({ updatedAt: -1 })
      .lean();
  },

  /**
   * Get all unread conversations for logged in user
   */
  async conversationsTotalUnreadCount(
    _root,
    _args,
    { user, models, subdomain }: IContext,
  ) {
    // initiate query builder
    const qb = new QueryBuilder(
      models,
      subdomain,
      {},
      { _id: user._id, code: user.code },
    );

    await qb.buildAllQueries();

    // get all possible integration ids
    const integrationsFilter = await qb.integrationsFilter();

    const response = await models.Conversations.countDocuments({
      ...integrationsFilter,
      status: { $in: [CONVERSATION_STATUSES.NEW, CONVERSATION_STATUSES.OPEN] },
      readUserIds: { $ne: user._id },
      $and: [{ $or: qb.userRelevanceQuery() }],
    });

    return response;
  },

  async inboxFields() {
    const response: {
      customer?: any[];
      conversation?: any[];
      device?: any[];
    } = {
      customer: [],
      conversation: [],
      device: [],
    };

    return response;
  },

  /**
   * Users conversations list
   */
  async userConversations(
    _root,
    { _id, perPage, ...args }: { _id: string; perPage: number },
    { models }: IContext,
  ) {
    const query = { participatedUserIds: { $in: [_id] } };

    const { list, totalCount, pageInfo } =
      await cursorPaginate<IConversationDocument>({
        model: models.Conversations,
        params: {
          ...args,
          limit: perPage,
        },
        query: query,
      });

    return { list, totalCount, pageInfo };
  },
};
