import { IContext } from '~/connectionResolvers';
import { CONVERSATION_STATUSES } from '@/inbox/db/definitions/constants';
import { calculatePercentage, normalizeStatus } from '@/reports/utils';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

export const reportQueries = {
  async reportConversationList(
    _parent: undefined,
    {
      filters = {},
    }: { filters?: { status?: string; limit?: number; page?: number } },
    { models }: IContext,
  ) {
    const status = normalizeStatus(filters.status);
    const limit = filters.limit || 20;
    const page = filters.page || 1;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (status) {
      query.status = status;
    }

    const [conversations, totalCount] = await Promise.all([
      models.Conversations.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      models.Conversations.countDocuments(query),
    ]);

    return {
      list: conversations,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    };
  },

  async reportConversationResponses(
    _parent: undefined,
    { filters = {} }: { filters?: { status?: string; limit?: number } },
    { models }: IContext,
  ) {
    const status = normalizeStatus(filters.status);

    const match: any = {};
    if (status) {
      match.status = status;
    }

    const responseStats = await models.Conversations.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'conversation_messages',
          localField: '_id',
          foreignField: 'conversationId',
          as: 'messages',
        },
      },
      {
        $project: {
          _id: 1,
          messageCount: { $size: '$messages' },
          firstRespondedDate: {
            $arrayElemAt: [
              {
                $filter: {
                  input: '$messages',
                  as: 'msg',
                  cond: { $eq: ['$$msg.internal', false] },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalResponses: { $sum: '$messageCount' },
          avgResponseTime: {
            $avg: {
              $subtract: ['$firstRespondedDate.createdAt', '$createdAt'],
            },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    if (responseStats.length === 0) {
      return {
        totalResponses: 0,
        avgResponseTime: 0,
        responseRate: 0,
        count: 0,
      };
    }

    const stats = responseStats[0];
    const responseRate =
      stats.count > 0
        ? Math.round((stats.totalResponses / stats.count) * 100) / 100
        : 0;

    return {
      totalResponses: stats.totalResponses,
      avgResponseTime: Math.round(stats.avgResponseTime || 0),
      responseRate,
      count: stats.count,
    };
  },

  async reportConversationOpen(
    _parent: undefined,
    { filters = {} }: { filters?: { status?: string } },
    { models }: IContext,
  ) {
    const status =
      normalizeStatus(filters.status) ?? CONVERSATION_STATUSES.OPEN;

    const [count, total] = await Promise.all([
      models.Conversations.countDocuments({ status }),
      models.Conversations.countDocuments({}),
    ]);

    return {
      count,
      percentage: calculatePercentage(count, total),
    };
  },

  async reportConversationClosed(
    _parent: undefined,
    { filters = {} }: { filters?: { status?: string } },
    { models }: IContext,
  ) {
    const status =
      normalizeStatus(filters.status) ?? CONVERSATION_STATUSES.CLOSED;

    const [count, total] = await Promise.all([
      models.Conversations.countDocuments({ status }),
      models.Conversations.countDocuments({}),
    ]);

    return {
      count,
      percentage: calculatePercentage(count, total),
    };
  },

  async reportConversationResolved(
    _parent: undefined,
    { filters = {} }: { filters?: { status?: string } },
    { models }: IContext,
  ) {
    const status =
      normalizeStatus(filters.status) ?? CONVERSATION_STATUSES.RESOLVED;

    const [count, total] = await Promise.all([
      models.Conversations.countDocuments({ status }),
      models.Conversations.countDocuments({}),
    ]);

    return {
      count,
      percentage: calculatePercentage(count, total),
    };
  },

  async reportConversationTags(
    _parent: undefined,
    { filters = {} }: { filters?: { status?: string; limit?: number } },
    { models, subdomain }: IContext,
  ): Promise<any[]> {
    const status =
      normalizeStatus(filters.status) ?? CONVERSATION_STATUSES.CLOSED;

    const limit = filters.limit ?? 10;

    const tagCounts = await models.Conversations.aggregate([
      {
        $match: {
          status,
          tagIds: { $exists: true, $not: { $size: 0 } },
        },
      },
      { $unwind: '$tagIds' },
      {
        $group: {
          _id: '$tagIds',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);

    const total = tagCounts.reduce((sum: number, t: any) => sum + t.count, 0);

    const tagIds = tagCounts.map((t: any) => t._id);

    const tags = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'tags',
      action: 'find',
      input: { query: { _id: { $in: tagIds } }, fields: { _id: 1, name: 1 } },
      defaultValue: [],
    });

    const tagMap = new Map<string, string>(
      tags.map((t: any) => [t._id.toString(), t.name]),
    );

    return tagCounts.map((tag: any) => ({
      _id: tag._id,
      name: tagMap.get(tag._id.toString()) || 'Unknown Tag',
      count: tag.count,
      percentage: calculatePercentage(tag.count, total),
    }));
  },

  async reportConversationSources(
    _parent: undefined,
    { filters = {} }: { filters?: { status?: string; limit?: number } },
    { models }: IContext,
  ): Promise<any[]> {
    const status = normalizeStatus(filters.status);
    const limit = filters.limit ?? 10;

    const match: any = {};
    if (status) {
      match.status = status;
    }

    const sources = await models.Conversations.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'integrations',
          localField: 'integrationId',
          foreignField: '_id',
          as: 'integration',
        },
      },
      { $unwind: '$integration' },
      {
        $group: {
          _id: '$integration.kind',
          name: { $first: '$integration.name' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);

    const total = sources.reduce((sum: number, s: any) => sum + s.count, 0);

    return sources.map((s: any) => ({
      _id: s._id,
      name: s.name || s._id,
      count: s.count,
      percentage: calculatePercentage(s.count, total),
    }));
  },
};
