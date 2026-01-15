import { IContext } from '~/connectionResolvers';
import { CONVERSATION_STATUSES } from '@/inbox/db/definitions/constants';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { PipelineStage } from 'mongoose';
import {
  buildConversationPipeline,
  buildDateGroupPipeline,
  buildConversationMatch,
  buildDateMatch,
  calculatePercentage,
  normalizeStatus,
} from '@/reports/utils';
import { IReportFilters } from '@/reports/@types/reportFilters';
export const reportQueries = {
  async conversationProgressChart(
    _parent: undefined,
    { customerId }: { customerId: string },
    { models }: IContext,
  ) {
    const statuses = ['new', 'open', 'closed', 'resolved'];

    const pipeline: PipelineStage[] = [
      {
        $match: {
          customerId,
          status: { $in: statuses },
        },
      },

      {
        $addFields: {
          createdAtDate: {
            $cond: {
              if: { $eq: [{ $type: '$createdAt' }, 'string'] },
              then: { $dateFromString: { dateString: '$createdAt' } },
              else: '$createdAt',
            },
          },
        },
      },

      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAtDate',
              },
            },
            status: '$status',
          },
          count: { $sum: 1 },
        },
      },

      {
        $group: {
          _id: '$_id.date',
          counts: {
            $push: {
              k: '$_id.status',
              v: '$count',
            },
          },
        },
      },

      {
        $project: {
          _id: 0,
          date: '$_id',
          counts: { $arrayToObject: '$counts' },
        },
      },

      {
        $project: {
          date: 1,
          new: { $ifNull: ['$counts.new', 0] },
          open: { $ifNull: ['$counts.open', 0] },
          closed: { $ifNull: ['$counts.closed', 0] },
          resolved: { $ifNull: ['$counts.resolved', 0] },
        },
      },

      { $sort: { date: 1 } },
    ];

    const chartData = await models.Conversations.aggregate(pipeline);

    const total = chartData.reduce(
      (sum: number, d: any) => sum + d.new + d.open + d.closed + d.resolved,
      0,
    );

    return {
      total,
      chartData,
    };
  },
  async conversationMemberProgress(
    _parent: undefined,
    { customerId }: { customerId: string },
    { models }: IContext,
  ) {
    const statuses = ['new', 'open', 'closed', 'resolved'];

    return models.Conversations.aggregate([
      {
        $match: {
          customerId,
          assignedUserId: { $ne: null },
          status: { $in: statuses },
        },
      },
      {
        $group: {
          _id: { assigneeId: '$assignedUserId', status: '$status' },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.assigneeId',
          counts: {
            $push: {
              k: '$_id.status',
              v: '$count',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          assigneeId: '$_id',
          counts: { $arrayToObject: '$counts' },
        },
      },
      {
        $project: {
          assigneeId: 1,
          new: { $ifNull: ['$counts.new', 0] },
          open: { $ifNull: ['$counts.open', 0] },
          closed: { $ifNull: ['$counts.closed', 0] },
          resolved: { $ifNull: ['$counts.resolved', 0] },
        },
      },
    ]);
  },

  async conversationSourceProgress(
    _parent: undefined,
    { customerId }: { customerId: string },
    { models }: IContext,
  ) {
    const statuses = [
      CONVERSATION_STATUSES.NEW,
      CONVERSATION_STATUSES.OPEN,
      CONVERSATION_STATUSES.CLOSED,
      CONVERSATION_STATUSES.RESOLVED,
    ];

    const facet: Record<string, any[]> = {};

    statuses.forEach((status) => {
      facet[status.toLowerCase()] = [
        { $match: { status } },

        {
          $lookup: {
            from: 'integrations',
            localField: 'integrationId',
            foreignField: '_id',
            as: 'integration',
          },
        },

        {
          $unwind: {
            path: '$integration',
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $group: {
            _id: { $ifNull: ['$integration.kind', 'unknown'] },
            count: { $sum: 1 },
          },
        },

        {
          $project: {
            _id: 0,
            source: '$_id',
            count: 1,
          },
        },

        { $sort: { count: -1 } },
      ];
    });

    return models.Conversations.aggregate([
      {
        $match: {
          customerId,
          assignedUserId: { $ne: null },
          status: { $in: statuses },
        },
      },
      { $facet: facet },
    ]);
  },

  async conversationTagProgress(
    _parent: undefined,
    { customerId }: { customerId: string },
    { models }: IContext,
  ) {
    const statuses = [
      CONVERSATION_STATUSES.NEW,
      CONVERSATION_STATUSES.OPEN,
      CONVERSATION_STATUSES.CLOSED,
      CONVERSATION_STATUSES.RESOLVED,
    ];

    const facet: Record<string, any[]> = {};

    statuses.forEach((status) => {
      facet[status.toLowerCase()] = [
        { $match: { status } },

        {
          $unwind: {
            path: '$tagIds',
            preserveNullAndEmptyArrays: false,
          },
        },

        {
          $group: {
            _id: '$tagIds',
            count: { $sum: 1 },
          },
        },

        {
          $project: {
            _id: 0,
            tagId: '$_id',
            count: 1,
          },
        },

        { $sort: { count: -1 } },
      ];
    });

    return models.Conversations.aggregate([
      {
        $match: {
          customerId,
          assignedUserId: { $ne: null },
          status: { $in: statuses },
          tagIds: { $exists: true, $not: { $size: 0 } },
        },
      },
      { $facet: facet },
    ]);
  },

  async reportConversationOpenDate(
    _parent: undefined,
    { filters = {} }: { filters?: IReportFilters },
    { models }: IContext,
  ) {
    const pipeline = await buildConversationPipeline(filters, models);

    pipeline.push(...buildDateGroupPipeline('createdAt'));

    const result = await models.Conversations.aggregate(pipeline);

    return result.map((r) => ({ date: r._id, count: r.count }));
  },

  async reportConversationOpen(
    _parent: undefined,
    { filters = {} }: { filters?: IReportFilters },
    { models }: IContext,
  ) {
    const status =
      normalizeStatus(filters.status) ?? CONVERSATION_STATUSES.OPEN;

    const query = {
      status,
      ...buildDateMatch(filters, 'createdAt'),
    };

    const baseQuery = buildConversationMatch(filters);

    const [openCount, totalCount] = await Promise.all([
      models.Conversations.countDocuments(query),
      models.Conversations.countDocuments(baseQuery),
    ]);

    return {
      count: openCount,
      percentage: calculatePercentage(openCount, totalCount),
    };
  },

  async reportConversationResolvedDate(
    _parent: undefined,
    { filters = {} }: { filters?: IReportFilters },
    { models }: IContext,
  ) {
    const pipeline = await buildConversationPipeline(filters, models);

    pipeline.unshift({
      $match: {
        status: CONVERSATION_STATUSES.CLOSED,
        ...buildDateMatch(filters, 'closedAt'),
      },
    });

    pipeline.push(...buildDateGroupPipeline('closedAt'));

    const result = await models.Conversations.aggregate(pipeline);

    return result.map((r) => ({
      date: r._id,
      count: r.count,
    }));
  },

  async reportConversationList(
    _parent: undefined,
    { filters = {} }: { filters?: IReportFilters },
    { models }: IContext,
  ) {
    const pipeline = await buildConversationPipeline(filters, models, {
      withPagination: true,
    });

    pipeline.push({ $sort: { updatedAt: -1 } });

    const query = buildConversationMatch(filters);

    const [list, totalCount] = await Promise.all([
      models.Conversations.aggregate(pipeline),
      models.Conversations.countDocuments(query),
    ]);

    return {
      list,
      totalCount,
      page: filters.page ?? 1,
      totalPages: Math.ceil(totalCount / (filters.limit ?? 20)),
    };
  },

  async reportConversationResponses(
    _parent: undefined,
    { filters = {} }: { filters?: IReportFilters },
    { models }: IContext,
  ) {
    const conversationPipeline = await buildConversationPipeline(
      filters,
      models,
    );

    const pipeline: any[] = [
      {
        $lookup: {
          from: 'conversations',
          localField: 'conversationId',
          foreignField: '_id',
          as: 'conversation',
        },
      },
      { $unwind: '$conversation' },
    ];

    conversationPipeline.forEach((stage) => {
      if (stage.$match) {
        const nested: any = {};
        Object.entries(stage.$match).forEach(([k, v]) => {
          nested[`conversation.${k}`] = v;
        });
        pipeline.push({ $match: nested });
      }
    });

    pipeline.push(
      { $match: { internal: false, userId: { $exists: true, $ne: null } } },
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
          userId: '$_id',
          user: 1,
          name: { $ifNull: ['$user.details.fullName', 'Unknown User'] },
          messageCount: 1,
        },
      },
      { $sort: { messageCount: -1 } },
    );

    if (filters.limit) pipeline.push({ $limit: filters.limit });

    return models.ConversationMessages.aggregate(pipeline);
  },

  async reportConversationClosed(
    _parent: undefined,
    { filters = {} }: { filters?: IReportFilters },
    { models }: IContext,
  ) {
    const status =
      normalizeStatus(filters.status) ?? CONVERSATION_STATUSES.CLOSED;

    const query = {
      status,
      ...buildDateMatch(filters, 'createdAt'),
    };

    const baseQuery = buildConversationMatch(filters);

    const [closedCount, totalCount] = await Promise.all([
      models.Conversations.countDocuments(query),
      models.Conversations.countDocuments(baseQuery),
    ]);

    return {
      count: closedCount,
      percentage: calculatePercentage(closedCount, totalCount),
    };
  },

  async reportConversationResolved(
    _parent: undefined,
    { filters = {} }: { filters?: IReportFilters },
    { models }: IContext,
  ) {
    const status =
      normalizeStatus(filters.status) ?? CONVERSATION_STATUSES.CLOSED;

    const query = {
      status,
      ...buildDateMatch(filters, 'closedAt'),
    };

    const baseQuery = buildConversationMatch(filters);

    const [resolvedCount, totalCount] = await Promise.all([
      models.Conversations.countDocuments(query),
      models.Conversations.countDocuments(baseQuery),
    ]);

    return {
      count: resolvedCount,
      percentage: calculatePercentage(resolvedCount, totalCount),
    };
  },

  async reportConversationTags(
    _parent: undefined,
    { filters = {} }: { filters?: IReportFilters },
    { models, subdomain }: IContext,
  ) {
    const pipeline = await buildConversationPipeline(filters, models);

    pipeline.push(
      { $unwind: '$tagIds' },
      { $group: { _id: '$tagIds', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: filters.limit ?? 10 },
    );

    const tagCounts = await models.Conversations.aggregate(pipeline);

    const total = tagCounts.reduce((s, t) => s + t.count, 0);
    const tagIds = tagCounts.map((t) => t._id);

    const tags = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'tags',
      action: 'find',
      input: { query: { _id: { $in: tagIds } }, fields: { _id: 1, name: 1 } },
      defaultValue: [],
    });

    const tagMap = new Map(tags.map((t) => [t._id.toString(), t.name]));

    return tagCounts.map((tag) => ({
      _id: tag._id,
      name: tagMap.get(tag._id.toString()) || 'Unknown Tag',
      count: tag.count,
      percentage: calculatePercentage(tag.count, total),
    }));
  },

  async reportConversationSources(
    _parent: undefined,
    { filters = {} }: { filters?: IReportFilters },
    { models }: IContext,
  ) {
    const pipeline = await buildConversationPipeline(filters, models);

    pipeline.push(
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
      { $limit: filters.limit ?? 10 },
    );

    const sources = await models.Conversations.aggregate(pipeline);
    const total = sources.reduce((s, i) => s + i.count, 0);

    return sources.map((s) => ({
      _id: s._id,
      name: s.name || s._id,
      count: s.count,
      percentage: calculatePercentage(s.count, total),
    }));
  },
};
