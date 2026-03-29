import { IReportFilters } from '@/reports/@types/reportFilters';
import { IModels } from '~/connectionResolvers';

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

export function buildDateGroupPipeline(field: string) {
  return [
    {
      $addFields: {
        __date: normalizeDateField(field),
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$__date',
          },
        },
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

  if (filters.status) {
    match.statusId = filters.status;
  }

  if (filters.channelIds?.length) {
    match.channelId = { $in: filters.channelIds };
  }

  if (filters.memberIds?.length) {
    match.assigneeId = { $in: filters.memberIds };
  }

  Object.assign(match, buildDateMatch(filters, 'createdAt'));

  return match;
}

export const buildTicketPipeline = async (filters: IReportFilters) => {
  const pipeline: any[] = [];
  const match = buildTicketMatch(filters);

  if (Object.keys(match).length > 1) {
    pipeline.push({ $match: match });
  }

  if (filters.limit) {
    pipeline.push({ $skip: filters.limit }, { $limit: filters.limit });
  }

  return pipeline;
};

export function buildTicketTagMatch(filters: IReportFilters) {
  const match: any = {
    type: 'ticket',
    tagIds: { $exists: true, $ne: [] },
  };

  if (filters.status) {
    match.statusId = filters.status;
  }

  if (filters.channelIds?.length) {
    match.channelId = { $in: filters.channelIds };
  }

  if (filters.memberIds?.length) {
    match.assigneeId = { $in: filters.memberIds };
  }

  return match;
}
