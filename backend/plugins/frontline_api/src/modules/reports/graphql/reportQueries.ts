import { IContext } from '~/connectionResolvers';
import { CONVERSATION_STATUSES } from '@/inbox/db/definitions/constants';
import { calculatePercentage, normalizeStatus } from '@/reports/utils';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { PipelineStage } from 'mongoose';

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
    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: 'conversations',
          localField: 'conversationId',
          foreignField: '_id',
          as: 'conversation',
        },
      },
      { $unwind: '$conversation' },
      {
        $match: {
          ...(status && { 'conversation.status': status }),
          internal: false,
          userId: { $exists: true, $ne: null },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$userId',
          user: { $first: '$user' },
          messageCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          user: 1,
          name: '$user.details.fullName',
          messageCount: 1,
        },
      },
      { $sort: { messageCount: -1 } },
    ];

    if (filters.limit) {
      pipeline.push({ $limit: filters.limit });
    }

    return models.ConversationMessages.aggregate(pipeline);
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
