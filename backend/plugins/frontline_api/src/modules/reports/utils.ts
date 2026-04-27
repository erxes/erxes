import { IReportFilters } from '@/reports/@types/reportFilters';
import { IModels } from '~/connectionResolvers';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

export const sourceMap: Record<string, string> = {
  'facebook-messenger': 'facebook-messenger',
  'facebook-post': 'facebook-post',
  'instagram-messenger': 'instagram-messenger',
  'instagram-post': 'instagram-post',
  calls: 'calls',
  messenger: 'messenger',
  form: 'form',
};

export const calculatePercentage = (value: number, total: number) => {
  if (total === 0) return 0;

  return Math.round((value / total) * 100);
};

export function buildDateMatch(
  filters: IReportFilters,
  field: 'createdAt' | 'closedAt',
) {
  if (!filters.fromDate && !filters.toDate) return {};

  const range: { $gte?: Date; $lte?: Date } = {};
  if (filters.fromDate) range.$gte = new Date(filters.fromDate);
  if (filters.toDate) range.$lte = new Date(filters.toDate);

  return { [field]: range };
}

export const normalizeStatus = (status?: string) => {
  if (!status) return null;
  return status.toLowerCase();
};

export async function generateConversationReportFilter(
  filters: IReportFilters,
  models: IModels,
  options: {
    dateField?: 'createdAt' | 'closedAt';
    statusOverride?: string;
  } = {},
): Promise<Record<string, any>> {
  const match: Record<string, any> = {};

  const status = options.statusOverride ?? normalizeStatus(filters.status);
  if (status) match.status = status;

  const dateField = options.dateField ?? 'createdAt';
  Object.assign(match, buildDateMatch(filters, dateField));

  if (filters.channelIds?.length) {
    const integrations = await models.Integrations.find({
      channelId: { $in: filters.channelIds },
    }).lean();

    if (!integrations.length) {
      return { integrationId: { $in: [] } };
    }

    match.integrationId = { $in: integrations.map((i) => i._id) };
  }

  if (filters.memberIds?.length) {
    match.assignedUserId = { $in: filters.memberIds };
  }

  if (filters.source && sourceMap[filters.source]) {
    const sourceIntegrations = await models.Integrations.find({
      kind: sourceMap[filters.source],
    }).lean();

    if (match.integrationId) {
      const channelIdSet = new Set(
        (match.integrationId.$in as any[]).map(String),
      );
      const intersection = sourceIntegrations
        .filter((i) => channelIdSet.has(i._id.toString()))
        .map((i) => i._id);
      match.integrationId = { $in: intersection };
    } else {
      match.integrationId = { $in: sourceIntegrations.map((i) => i._id) };
    }
  }

  if (
    filters.callStatus &&
    filters.source &&
    sourceMap[filters.source] === 'calls'
  ) {
    const callHistories = await models.CallHistory.find(
      { callStatus: filters.callStatus },
      { conversationId: 1 },
    ).lean();

    const conversationIds = (callHistories as any[])
      .map((h) => h.conversationId)
      .filter(Boolean);

    if (!conversationIds.length) {
      return { _id: { $in: [] } };
    }

    match._id = { $in: conversationIds };
  }

  return match;
}

export const buildConversationPipeline = async (
  filters: IReportFilters,
  models: IModels,
  options: { withPagination?: boolean } = {},
) => {
  const pipeline: any[] = [];
  const match = await generateConversationReportFilter(filters, models);

  if (Object.keys(match).length) {
    pipeline.push({ $match: match });
  }

  if (options.withPagination) {
    if (filters.page && filters.limit) {
      pipeline.push(
        { $skip: (filters.page - 1) * filters.limit },
        { $limit: filters.limit },
      );
    } else if (filters.limit) {
      pipeline.push({ $limit: filters.limit });
    }
  }

  return pipeline;
};

export async function buildConversationStatusCountReport(
  filters: IReportFilters,
  models: IModels,
  options: {
    statusDefault: string;
    dateField: 'createdAt' | 'closedAt';
  },
) {
  const statusOverride =
    normalizeStatus(filters.status) ?? options.statusDefault;

  const [statusFilter, baseFilter] = await Promise.all([
    generateConversationReportFilter(filters, models, {
      statusOverride,
      dateField: options.dateField,
    }),
    generateConversationReportFilter(filters, models),
  ]);

  const [count, totalCount] = await Promise.all([
    models.Conversations.countDocuments(statusFilter),
    models.Conversations.countDocuments(baseFilter),
  ]);

  return {
    count,
    percentage: calculatePercentage(count, totalCount),
  };
}

export async function buildConversationDateReport(
  filters: IReportFilters,
  models: IModels,
  dateField: string,
  extraMatch?: Record<string, any>,
): Promise<Array<{ date: string; count: number }>> {
  const pipeline = await buildConversationPipeline(filters, models);

  if (extraMatch) {
    pipeline.unshift({ $match: extraMatch });
  }

  pipeline.push(...buildDateGroupPipeline(dateField));

  if (filters.limit) {
    pipeline.push({ $limit: filters.limit });
  }

  const result = await models.Conversations.aggregate(pipeline);
  return result.map((r) => ({ date: r._id, count: r.count }));
}

export async function buildConversationResponsesPipeline(
  filters: IReportFilters,
  models: IModels,
): Promise<any[] | null> {
  const pipeline: any[] = [];
  const messageMatch: {
    internal: boolean;
    userId: { $exists: boolean; $ne: null };
    createdAt?: { $gte?: Date; $lte?: Date };
    [key: string]: unknown;
  } = {
    internal: false,
    userId: { $exists: true, $ne: null },
  };

  if (filters.fromDate || filters.toDate) {
    const range: { $gte?: Date; $lte?: Date } = {};
    if (filters.fromDate) range.$gte = new Date(filters.fromDate);
    if (filters.toDate) range.$lte = new Date(filters.toDate);
    messageMatch.createdAt = range;
  }

  const needsConversationJoin =
    filters.channelIds?.length || filters.memberIds?.length || filters.source;

  if (needsConversationJoin) {
    pipeline.push(
      {
        $lookup: {
          from: 'conversations',
          localField: 'conversationId',
          foreignField: '_id',
          as: 'conversation',
        },
      },
      { $unwind: '$conversation' },
    );

    if (filters.channelIds?.length) {
      const integrations = await models.Integrations.find({
        channelId: { $in: filters.channelIds },
      }).lean();

      if (!integrations.length) return null;

      messageMatch['conversation.integrationId'] = {
        $in: integrations.map((i) => i._id),
      };
    }

    if (filters.memberIds?.length) {
      messageMatch['conversation.assignedUserId'] = {
        $in: filters.memberIds,
      };
    }

    if (filters.source && sourceMap[filters.source]) {
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
      );
      messageMatch['integration.kind'] = sourceMap[filters.source];
    }
  }

  pipeline.push({ $match: messageMatch });
  return pipeline;
}

export function normalizeDateField(field: string) {
  return {
    $cond: {
      if: { $eq: [{ $type: `$${field}` }, 'string'] },
      then: { $dateFromString: { dateString: `$${field}` } },
      else: `$${field}`,
    },
  };
}

export function buildDateGroupPipeline(field: string, frequency?: string) {
  const freq = frequency?.toLowerCase();

  let groupId: any;
  if (freq === 'year') {
    groupId = { $dateToString: { format: '%Y', date: '$__date' } };
  } else if (freq === 'month') {
    groupId = { $dateToString: { format: '%Y-%m', date: '$__date' } };
  } else if (freq === 'week') {
    groupId = {
      $concat: [
        { $toString: { $isoWeekYear: '$__date' } },
        '-W',
        {
          $toString: {
            $cond: [
              { $lt: [{ $isoWeek: '$__date' }, 10] },
              { $concat: ['0', { $toString: { $isoWeek: '$__date' } }] },
              { $toString: { $isoWeek: '$__date' } },
            ],
          },
        },
      ],
    };
  } else {
    groupId = { $dateToString: { format: '%Y-%m-%d', date: '$__date' } };
  }

  return [
    {
      $addFields: {
        __date: normalizeDateField(field),
      },
    },
    {
      $group: {
        _id: groupId,
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ];
}

export function buildConversationMatch(filters: IReportFilters) {
  const match: Record<string, unknown> = {};

  const status = normalizeStatus(filters.status);
  if (status) match.status = status;

  Object.assign(match, buildDateMatch(filters, 'createdAt'));

  return match;
}

export function buildTicketMatch(filters: IReportFilters) {
  const match: Record<string, unknown> = { type: 'ticket' };
  const andConditions: Record<string, unknown>[] = [];

  if (filters.status) {
    match.statusId = filters.status;
  }

  if (filters.state) {
    if (filters.state === 'active') {
      andConditions.push({
        $or: [{ state: 'active' }, { state: { $exists: false } }],
      });
    } else {
      match.state = filters.state;
    }
  }

  if (filters.channelIds?.length) {
    match.channelId = { $in: filters.channelIds };
  }

  if (filters.memberIds?.length) {
    match.assigneeId = { $in: filters.memberIds };
  }

  if (filters.pipelineIds?.length) {
    match.pipelineId = { $in: filters.pipelineIds };
  }

  if (filters.tagIds?.length) {
    match.tagIds = { $in: filters.tagIds };
  }

  if (filters.priority?.length) {
    const hasPriorityZero = filters.priority.includes(0);
    if (hasPriorityZero) {
      andConditions.push({
        $or: [
          { priority: { $in: filters.priority } },
          { priority: { $exists: false } },
        ],
      });
    } else {
      match.priority = { $in: filters.priority };
    }
  }

  if (filters.branchIds?.length) {
    match.branchId = { $in: filters.branchIds };
  }

  if (filters.startDate) {
    match.startDate = { $gte: new Date(filters.startDate) };
  }

  if (filters.targetDate) {
    match.targetDate = { $lte: new Date(filters.targetDate) };
  }

  Object.assign(match, buildDateMatch(filters, 'createdAt'));

  if (andConditions.length) {
    match.$and = andConditions;
  }

  return match;
}

export const buildTicketPipeline = async (
  filters: IReportFilters,
  subdomain: string,
) => {
  const pipeline: any[] = [];
  const match = buildTicketMatch(filters);

  if (filters.customerIds?.length || filters.companyIds?.length) {
    const ticketIdSets: Set<string>[] = [];

    if (filters.customerIds?.length) {
      const relatedTicketIds: string[] = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'query',
        module: 'relation',
        action: 'filterRelationIds',
        input: {
          contentType: 'core:customer',
          contentIds: filters.customerIds,
          relatedContentType: 'frontline:ticket',
        },
        defaultValue: [],
      });
      ticketIdSets.push(new Set(relatedTicketIds));
    }

    if (filters.companyIds?.length) {
      const relatedTicketIds: string[] = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'query',
        module: 'relation',
        action: 'filterRelationIds',
        input: {
          contentType: 'core:company',
          contentIds: filters.companyIds,
          relatedContentType: 'frontline:ticket',
        },
        defaultValue: [],
      });
      ticketIdSets.push(new Set(relatedTicketIds));
    }

    // Intersect all sets to get tickets matching ALL contact filters
    let filteredIds: string[] = [];
    if (ticketIdSets.length === 1) {
      filteredIds = [...ticketIdSets[0]];
    } else if (ticketIdSets.length > 1) {
      filteredIds = [...ticketIdSets[0]].filter((id) =>
        ticketIdSets.every((s) => s.has(id)),
      );
    }

    if (!filteredIds.length) {
      match._id = { $in: [] };
    } else {
      match._id = { $in: filteredIds };
    }
  }

  pipeline.push({ $match: match });

  return pipeline;
};

export function buildTicketTagMatch(filters: IReportFilters) {
  const match = buildTicketMatch(filters) as any;
  match.tagIds = { $exists: true, $ne: [] };
  return match;
}
