import { IMessageDocument } from '@/inbox/@types/conversationMessages';
import {
  IConversationDocument,
  IConversationListParams,
  IConversationRes,
} from '@/inbox/@types/conversations';
import {
  authorizeConversationAccess,
  countByConversations,
} from '@/inbox/conversationUtils';
import {
  CONVERSATION_AUTOMATION_STATUS,
  CONVERSATION_STATUSES,
} from '@/inbox/db/definitions/constants';
import { cursorPaginate, markResolvers } from 'erxes-api-shared/utils';
import { IContext, IModels } from '~/connectionResolvers';
import QueryBuilder, { IListArgs } from '~/conversationQueryBuilder';
import { FilterQuery } from 'mongoose';

const count = async (
  models: IModels,
  query: FilterQuery<IConversationDocument>,
): Promise<number> => {
  const result = await models.Conversations.countDocuments(query);
  return Number(result);
};

const toQueryUser = (user: IContext['user']) => ({
  _id: user._id,
  code: user.code,
  starredConversationIds: user.starredConversationIds,
  role: user.role,
});

export const conversationQueries = {
  /**
   * Conversations list
   */
  async conversations(
    _parent: undefined,
    params: IConversationListParams,
    { user, models, subdomain }: IContext,
  ) {
    if (params?.ids) {
      const { list, totalCount, pageInfo } =
        await cursorPaginate<IConversationDocument>({
          model: models.Conversations,
          params: {
            ...params,
            orderBy: params.orderBy ?? { updatedAt: -1 },
          },
          query: { _id: { $in: params.ids } },
        });

      return { list, totalCount, pageInfo };
    }

    if (params?.customerId) {
      const { list, totalCount, pageInfo } =
        await cursorPaginate<IConversationDocument>({
          model: models.Conversations,
          params: {
            ...params,
            orderBy: params.orderBy ?? { updatedAt: -1 },
            limit: params.limit || 20,
          },
          query: { customerId: params.customerId },
        });

      return { list, totalCount, pageInfo };
    }

    const qb = new QueryBuilder(models, subdomain, params, toQueryUser(user));

    await qb.buildAllQueries();

    const { list, totalCount, pageInfo } =
      await cursorPaginate<IConversationDocument>({
        model: models.Conversations,
        params: {
          ...params,
          orderBy: params.orderBy ?? { updatedAt: -1 },
          limit: params.limit || 20,
        },
        query: qb.mainQuery(),
      });

    return { list, totalCount, pageInfo };
  },

  conversationMessage(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.ConversationMessages.findOne({ _id });
  },
  async conversationPinnedMessages(
    _root,
    { conversationId }: { conversationId: string },
    { user, models }: IContext,
  ) {
    await authorizeConversationAccess(models, user, conversationId);
    return models.ConversationMessages.find({
      conversationId,
      'extraData.discordPinned': true,
    }).sort({ createdAt: -1 });
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
      const sort: { createdAt: 1 | -1 } = getFirst
        ? { createdAt: 1 }
        : { createdAt: -1 };

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
  conversationMessagesTotalCount(
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
    const _user = toQueryUser(user);

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

    // conversations where the current user was mentioned
    response.mentioned = await count(models, {
      ...mainQuery,
      ...(await qb.mentionedFilter()),
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

    const automationCounts = await Promise.all(
      CONVERSATION_AUTOMATION_STATUS.ALL.map((key) =>
        count(models, { ...mainQuery, ...qb.automationStatusFilter(key) }),
      ),
    );

    CONVERSATION_AUTOMATION_STATUS.ALL.forEach((key, index) => {
      response[key] = automationCounts[index];
    });

    return response;
  },

  /**
   * Get one conversation
   */
  conversationDetail(_root, { _id }: { _id: string }, { models }: IContext) {
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
    const qb = new QueryBuilder(models, subdomain, params, toQueryUser(user));

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
    const qb = new QueryBuilder(models, subdomain, params, toQueryUser(user));

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

  inboxFields() {
    const response: Record<'customer' | 'conversation' | 'device', unknown[]> =
      {
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
        query,
      });

    return { list, totalCount, pageInfo };
  },
};

markResolvers(conversationQueries, {
  wrapperConfig: {
    skipPermission: true,
  },
});
