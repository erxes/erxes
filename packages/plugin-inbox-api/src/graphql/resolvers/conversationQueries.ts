import { CONVERSATION_STATUSES } from '../../models/definitions/constants';
import { IMessageDocument } from '../../models/definitions/conversationMessages';
import { countByConversations } from '../../conversationUtils';

import {
  checkPermission,
  moduleRequireLogin
} from '@erxes/api-utils/src/permissions';

import QueryBuilder, { IListArgs } from '../../conversationQueryBuilder';
import { IContext, IModels } from '../../connectionResolver';
import { sendFormsMessage } from '../../messageBroker';
import { paginate } from '@erxes/api-utils/src';

interface ICountBy {
  [index: string]: number;
}

interface IConversationRes {
  [index: string]: number | ICountBy;
}

// count helper
const count = async (models: IModels, query: any): Promise<number> => {
  const result = await models.Conversations.find(query).countDocuments();

  return Number(result);
};

const conversationQueries: any = {
  /**
   * Conversations list
   */
  async conversations(
    _root,
    params: IListArgs,
    { user, models, subdomain, serverTiming }: IContext
  ) {
    serverTiming.startTime('conversations');

    // filter by ids of conversations
    if (params && params.ids) {
      return models.Conversations.find({ _id: { $in: params.ids } }).sort({
        updatedAt: -1
      });
    }

    serverTiming.startTime('buildQuery');

    // initiate query builder
    const qb = new QueryBuilder(models, subdomain, params, {
      _id: user._id,
      code: user.code,
      starredConversationIds: user.starredConversationIds,
      role: user.role
    });

    await qb.buildAllQueries();

    serverTiming.endTime('buildQuery');

    serverTiming.startTime('conversationsQuery');

    const conversations = await models.Conversations.find(qb.mainQuery())
      .sort({ updatedAt: -1 })
      .limit(params.limit || 0);

    serverTiming.endTime('conversationsQuery');

    serverTiming.endTime('conversations');

    return conversations;
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
    },
    { models }: IContext
  ) {
    const query = { conversationId };

    let messages: IMessageDocument[] = [];

    if (limit) {
      const sort = getFirst ? { createdAt: 1 } : { createdAt: -1 };

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
    { models }: IContext
  ) {
    return models.ConversationMessages.countDocuments({ conversationId });
  },

  /**
   * Group conversation counts by brands, channels, integrations, status
   */
  async conversationCounts(
    _root,
    params: IListArgs,
    { user, models, subdomain }: IContext
  ) {
    const { only } = params;

    const response: IConversationRes = {};
    const _user = {
      _id: user._id,
      code: user.code,
      starredConversationIds: user.starredConversationIds,
      role: user.role
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
        only
      );
    }

    const mainQuery = {
      ...qb.mainQuery(),
      ...queries.integrations,
      ...queries.extended
    };

    // unassigned count
    response.unassigned = await count(models, {
      ...mainQuery,
      ...qb.unassignedFilter()
    });

    // participating count
    response.participating = await count(models, {
      ...mainQuery,
      ...qb.participatingFilter()
    });

    // starred count
    response.starred = await count(models, {
      ...mainQuery,
      ...qb.starredFilter()
    });

    // resolved count
    response.resolved = await count(models, {
      ...mainQuery,
      ...qb.statusFilter(['closed'])
    });

    // awaiting response count
    response.awaitingResponse = await count(models, {
      ...mainQuery,
      ...qb.awaitingResponse()
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
    { user, models, subdomain }: IContext
  ) {
    // initiate query builder
    const qb = new QueryBuilder(models, subdomain, params, {
      _id: user._id,
      code: user.code,
      starredConversationIds: user.starredConversationIds
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
    { user, models, subdomain }: IContext
  ) {
    // initiate query builder
    const qb = new QueryBuilder(models, subdomain, params, {
      _id: user._id,
      code: user.code,
      starredConversationIds: user.starredConversationIds
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
    { user, models, subdomain, serverTiming }: IContext
  ) {
    serverTiming.startTime('buildQuery');

    // initiate query builder
    const qb = new QueryBuilder(
      models,
      subdomain,
      {},
      { _id: user._id, code: user.code }
    );

    await qb.buildAllQueries();

    serverTiming.endTime('buildQuery');

    serverTiming.startTime('integrationFilter');

    // get all possible integration ids
    const integrationsFilter = await qb.integrationsFilter();

    serverTiming.endTime('integrationFilter');

    serverTiming.startTime('query');

    const response = await models.Conversations.find({
      ...integrationsFilter,
      status: { $in: [CONVERSATION_STATUSES.NEW, CONVERSATION_STATUSES.OPEN] },
      readUserIds: { $ne: user._id },
      $and: [{ $or: qb.userRelevanceQuery() }]
    }).countDocuments();

    serverTiming.endTime('query');

    return response;
  },

  async inboxFields(_root, _args, { subdomain }: IContext) {
    const response: {
      customer?: any[];
      conversation?: any[];
      device?: any[];
    } = {
      customer: [],
      conversation: [],
      device: []
    };

    const customerGroup = await sendFormsMessage({
      subdomain,
      action: 'fieldsGroups.findOne',
      data: {
        query: {
          contentType: 'contacts:customer',
          isDefinedByErxes: true,
          name: 'Basic information'
        }
      },
      isRPC: true
    });

    if (customerGroup) {
      response.customer = await sendFormsMessage({
        subdomain,
        action: 'fields.find',
        data: {
          query: {
            groupId: customerGroup._id
          }
        },
        isRPC: true,
        defaultValue: []
      });
    }

    const conversationGroup = await sendFormsMessage({
      subdomain,
      action: 'fieldsGroups.findOne',
      data: {
        query: {
          contentType: 'inbox:conversation',
          isDefinedByErxes: true,
          name: 'Basic information'
        }
      },
      isRPC: true
    });

    if (conversationGroup) {
      response.conversation = await sendFormsMessage({
        subdomain,
        action: 'fields.find',
        data: {
          query: {
            groupId: conversationGroup._id
          }
        },
        isRPC: true,
        defaultValue: []
      });
    }

    const deviceGroup = await sendFormsMessage({
      subdomain,
      action: 'fieldsGroups.findOne',
      data: {
        query: {
          contentType: 'contacts:device',
          isDefinedByErxes: true,
          name: 'Basic information'
        }
      },
      isRPC: true
    });

    if (deviceGroup) {
      response.device = await sendFormsMessage({
        subdomain,
        action: 'fields.find',
        data: {
          query: {
            groupId: deviceGroup._id
          }
        },
        isRPC: true,
        defaultValue: []
      });
    }

    return response;
  },

  /**
   * Users conversations list
   */
  async userConversations(
    _root,
    { _id, perPage }: { _id: string; perPage: number },
    { models }: IContext
  ) {
    const selector = { participatedUserIds: { $in: [_id] } };

    const list = paginate(models.Conversations.find(selector), { perPage });
    const totalCount = models.Conversations.find(selector).countDocuments();

    return { list, totalCount };
  }
};

moduleRequireLogin(conversationQueries);

checkPermission(conversationQueries, 'conversations', 'showConversations', []);

conversationQueries.conversationMessage = (
  _,
  { _id },
  { models }: IContext
) => {
  return models.ConversationMessages.findOne({ _id });
};

export default conversationQueries;
