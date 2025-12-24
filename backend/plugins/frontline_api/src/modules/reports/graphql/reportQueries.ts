import { IContext } from '~/connectionResolvers';
import { CONVERSATION_STATUSES } from '@/inbox/db/definitions/constants';
import { calculatePercentage, normalizeStatus } from '@/reports/utils';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { PipelineStage } from 'mongoose';
import {
  applyLimitAndPage,
  buildCreatedAtMatch,
  buildPagination,
  buildStatusMatch,
  buildConversationTagsPipeline,
  buildConversationSourcesPipeline,
  buildSourceFilterPipeline,
  buildClosedAtMatch,
  sourceMap,
} from '@/reports/utils';
import {
  IReportFilters,
  IReportTagsFilters,
} from '@/reports/@types/reportFilters';
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
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt',
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
    {
      filters = {},
    }: {
      filters?: IReportFilters;
    },
    { models }: IContext,
  ) {
    const match = {
      ...buildCreatedAtMatch(filters),
      ...buildStatusMatch(filters),
    };

    const pipeline: PipelineStage[] = [{ $match: match }];

    buildSourceFilterPipeline(pipeline, filters, {
      createdAt: 1,
      status: 1,
    });

    pipeline.push(
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    );

    if (filters.limit) {
      pipeline.push({ $limit: filters.limit });
    }

    const result = await models.Conversations.aggregate(pipeline);

    return result.map((item) => ({
      date: item._id,
      count: item.count,
    }));
  },

  async reportConversationResolvedDate(
    _parent: undefined,
    {
      filters = {},
    }: {
      filters?: IReportFilters;
    },
    { models }: IContext,
  ) {
    const match = {
      status: CONVERSATION_STATUSES.CLOSED,
      ...buildClosedAtMatch(filters),
    };

    const pipeline: PipelineStage[] = [{ $match: match }];
    buildSourceFilterPipeline(pipeline, filters, {
      closedAt: 1,
      status: 1,
    });

    pipeline.push(
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$closedAt',
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    );

    if (filters.limit) {
      pipeline.push({ $limit: filters.limit });
    }

    const result = await models.Conversations.aggregate(pipeline);

    return result.map((item) => ({
      date: item._id,
      count: item.count,
    }));
  },

  async reportConversationResponseTemplate(
    _parent: undefined,
    {
      filters = {},
    }: {
      filters?: IReportFilters;
    },
    { models }: IContext,
  ) {
    const match = {
      responseTemplateId: { $exists: true, $ne: null },
      ...buildCreatedAtMatch(filters),
    };

    const pipeline: any[] = [
      { $match: match },

      {
        $lookup: {
          from: 'response_templates',
          localField: 'responseTemplateId',
          foreignField: '_id',
          as: 'template',
        },
      },
      { $unwind: '$template' },

      {
        $group: {
          _id: '$responseTemplateId',
          template: {
            $first: {
              _id: '$template._id',
              name: '$template.name',
              content: '$template.content',
              channelId: '$template.channelId',
              createdAt: '$template.createdAt',
              updatedAt: '$template.updatedAt',
            },
          },
          usageCount: { $sum: 1 },
          lastUsed: { $max: '$createdAt' },
        },
      },

      { $sort: { usageCount: -1 } },
    ];

    applyLimitAndPage(pipeline, filters);

    return models.ConversationMessages.aggregate(pipeline);
  },

  async reportConversationList(
    _parent: undefined,
    {
      filters = {},
    }: {
      filters?: IReportFilters;
    },
    { models }: IContext,
  ) {
    const { limit, page, skip } = buildPagination(filters);

    const query = buildStatusMatch(filters);

    const pipeline: any[] = [{ $match: query }];

    buildSourceFilterPipeline(pipeline, filters);

    pipeline.push(
      { $sort: { updatedAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    );

    const [conversations, totalCountArr] = await Promise.all([
      models.Conversations.aggregate(pipeline),
      models.Conversations.countDocuments(query),
    ]);

    return {
      list: conversations,
      totalCount: totalCountArr,
      page,
      totalPages: Math.ceil(totalCountArr / limit),
    };
  },

  async reportConversationResponses(
    _parent: undefined,
    {
      filters = {},
    }: {
      filters?: IReportFilters;
    },
    { models }: IContext,
  ) {
    const status = normalizeStatus(filters.status);

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
      {
        $match: {
          ...(status && { 'conversation.status': status }),
          internal: false,
          userId: { $exists: true, $ne: null },
          ...buildCreatedAtMatch(filters),
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
    ];

    if (filters.source && filters.source !== 'all') {
      const integrationKind = sourceMap[filters.source];
      if (integrationKind) {
        pipeline.push(
          {
            $lookup: {
              from: 'integrations',
              localField: 'conversation.integrationId',
              foreignField: '_id',
              as: 'integration',
            },
          },
          { $unwind: '$integration' },
          { $match: { 'integration.kind': integrationKind } },
          {
            $project: {
              userId: 1,
              user: 1,
              conversation: 1,
            },
          },
        );
      }
    }

    pipeline.push(
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
          name: '$user.details.fullName',
          messageCount: 1,
        },
      },
      { $sort: { messageCount: -1 } },
    );

    if (filters.limit) {
      pipeline.push({ $limit: filters.limit });
    }

    return models.ConversationMessages.aggregate(pipeline);
  },

  async reportConversationOpen(
    _parent: undefined,
    {
      filters = {},
    }: {
      filters?: IReportFilters;
    },
    { models }: IContext,
  ) {
    const status =
      normalizeStatus(filters.status) ?? CONVERSATION_STATUSES.OPEN;

    const query = {
      status,
      ...buildCreatedAtMatch(filters),
    };

    const [openCount, totalCount] = await Promise.all([
      models.Conversations.countDocuments(query),
      models.Conversations.countDocuments({}),
    ]);

    return {
      count: openCount,
      percentage: calculatePercentage(openCount, totalCount),
    };
  },

  async reportConversationClosed(
    _parent: undefined,
    {
      filters = {},
    }: {
      filters?: IReportFilters;
    },
    { models }: IContext,
  ) {
    const status =
      normalizeStatus(filters.status) ?? CONVERSATION_STATUSES.CLOSED;

    const query = {
      status,
      ...buildCreatedAtMatch(filters),
    };

    const [closedCount, totalCount] = await Promise.all([
      models.Conversations.countDocuments(query),
      models.Conversations.countDocuments({}),
    ]);

    return {
      count: closedCount,
      percentage: calculatePercentage(closedCount, totalCount),
    };
  },

  async reportConversationResolved(
    _parent: undefined,
    {
      filters = {},
    }: {
      filters?: IReportFilters;
    },
    { models }: IContext,
  ) {
    const status =
      normalizeStatus(filters.status) ?? CONVERSATION_STATUSES.CLOSED;

    const query = {
      status,
      ...buildClosedAtMatch(filters),
    };

    const [resolvedCount, totalCount] = await Promise.all([
      models.Conversations.countDocuments(query),
      models.Conversations.countDocuments({}),
    ]);

    return {
      count: resolvedCount,
      percentage: calculatePercentage(resolvedCount, totalCount),
    };
  },

  async reportConversationTags(
    _parent: undefined,
    {
      filters = {},
    }: {
      filters?: IReportTagsFilters;
    },
    { models, subdomain }: IContext,
  ): Promise<any[]> {
    const pipeline = buildConversationTagsPipeline(filters);

    const tagCounts = await models.Conversations.aggregate(pipeline);

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
    {
      filters = {},
    }: {
      filters?: IReportTagsFilters;
    },
    { models }: IContext,
  ): Promise<any[]> {
    const pipeline = buildConversationSourcesPipeline(filters);

    const sources = await models.Conversations.aggregate(pipeline);

    const total = sources.reduce((sum: number, s: any) => sum + s.count, 0);

    return sources.map((s: any) => ({
      _id: s._id,
      name: s.name || s._id,
      count: s.count,
      percentage: calculatePercentage(s.count, total),
    }));
  },
};
