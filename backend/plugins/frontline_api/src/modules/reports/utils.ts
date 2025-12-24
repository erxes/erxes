import { CONVERSATION_STATUSES } from '@/inbox/db/definitions/constants';
import {
  IReportFilters,
  IReportTagsFilters,
} from '@/reports/@types/reportFilters';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  subWeeks,
  subMonths,
  subYears,
} from 'date-fns';

export const calculatePercentage = (count: number, total: number): number =>
  total > 0 ? Math.round((count / total) * 100) : 0;

export const normalizeStatus = (status?: string) => {
  if (!status) return undefined;
  const upper = status.toUpperCase();
  return Object.values(CONVERSATION_STATUSES).includes(upper as any)
    ? upper
    : undefined;
};

export const getDateRange = (dateRange: {
  type: string;
  fromDate?: Date | string;
  toDate?: Date | string;
}): { startDate: Date; endDate: Date } | null => {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  switch (dateRange.type) {
    case 'TODAY': {
      startDate = startOfDay(now);
      endDate = endOfDay(now);
      break;
    }
    case 'YESTERDAY': {
      const yesterday = subDays(now, 1);
      startDate = startOfDay(yesterday);
      endDate = endOfDay(yesterday);
      break;
    }
    case 'THIS_WEEK': {
      startDate = startOfWeek(now, { weekStartsOn: 1 });
      endDate = endOfWeek(now, { weekStartsOn: 1 });
      break;
    }
    case 'LAST_WEEK': {
      const lastWeek = subWeeks(now, 1);
      startDate = startOfWeek(lastWeek, { weekStartsOn: 1 });
      endDate = endOfWeek(lastWeek, { weekStartsOn: 1 });
      break;
    }
    case 'THIS_MONTH': {
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      break;
    }
    case 'LAST_MONTH': {
      const lastMonth = subMonths(now, 1);
      startDate = startOfMonth(lastMonth);
      endDate = endOfMonth(lastMonth);
      break;
    }
    case 'THIS_YEAR': {
      startDate = startOfYear(now);
      endDate = endOfYear(now);
      break;
    }
    case 'LAST_YEAR': {
      const lastYear = subYears(now, 1);
      startDate = startOfYear(lastYear);
      endDate = endOfYear(lastYear);
      break;
    }
    case 'CUSTOM': {
      if (!dateRange.fromDate || !dateRange.toDate) {
        throw new Error(
          'Both fromDate and toDate are required for CUSTOM date range',
        );
      }
      startDate = new Date(dateRange.fromDate);
      endDate = new Date(dateRange.toDate);
      break;
    }
    default:
      return null;
  }

  return { startDate, endDate };
};

export const sourceMap: Record<string, string> = {
  'facebook-messenger': 'facebook-messenger',
  'facebook-post': 'facebook-post',
  'instagram-messenger': 'instagram-messenger',
  'instagram-post': 'instagram-post',
  call: 'call',
  messenger: 'messenger',
  form: 'form',
};

export function buildDateMatch(
  filters: IReportFilters,
  field: 'createdAt' | 'closedAt' = 'createdAt',
) {
  const match: any = {};

  if (filters.date) {
    const range = getDateRange({ type: filters.date });
    if (range) {
      match[field] = {
        $gte: range.startDate,
        $lte: range.endDate,
      };
    }
  } else if (filters.fromDate || filters.toDate) {
    match[field] = {};
    if (filters.fromDate) match[field].$gte = new Date(filters.fromDate);
    if (filters.toDate) match[field].$lte = new Date(filters.toDate);
  }

  return match;
}

export function buildClosedAtMatch(filters: IReportFilters) {
  const match: any = { closedAt: { $exists: true } };

  if (filters.date) {
    const range = getDateRange({ type: filters.date });
    if (range) {
      match.closedAt = {
        $gte: range.startDate,
        $lte: range.endDate,
      };
    }
  } else if (filters.fromDate || filters.toDate) {
    match.closedAt = {};
    if (filters.fromDate) match.closedAt.$gte = new Date(filters.fromDate);
    if (filters.toDate) match.closedAt.$lte = new Date(filters.toDate);
  }

  return match;
}

export function buildStatusMatch(filters: IReportFilters) {
  const query: any = {};
  const status = normalizeStatus(filters.status);

  if (status) {
    query.status = status;
  }

  return query;
}

export function applyLimitAndPage(pipeline: any[], filters: IReportFilters) {
  if (!filters.limit) return;

  const page = filters.page ?? 1;
  const skip = (page - 1) * filters.limit;

  pipeline.push({ $skip: skip }, { $limit: filters.limit });
}

export function buildCreatedAtMatch(filters: IReportFilters) {
  const match: any = {};

  if (filters.date) {
    const range = getDateRange({ type: filters.date });

    if (range) {
      match.createdAt = {
        $gte: range.startDate,
        $lte: range.endDate,
      };
    }
  } else if (filters.fromDate || filters.toDate) {
    match.createdAt = {};

    if (filters.fromDate) {
      match.createdAt.$gte = new Date(filters.fromDate);
    }

    if (filters.toDate) {
      match.createdAt.$lte = new Date(filters.toDate);
    }
  }

  return match;
}

export function buildPagination(filters: IReportFilters) {
  const limit = filters.limit ?? 20;
  const page = filters.page ?? 1;
  const skip = (page - 1) * limit;

  return { limit, page, skip };
}

function buildConversationTagsMatch(filters: IReportTagsFilters) {
  const status =
    normalizeStatus(filters.status) ?? CONVERSATION_STATUSES.CLOSED;

  const match: any = {
    status,
    tagIds: { $exists: true, $not: { $size: 0 } },
  };

  // Add date filtering
  if (filters.date) {
    const range = getDateRange({ type: filters.date });
    if (range) {
      match.createdAt = {
        $gte: range.startDate,
        $lte: range.endDate,
      };
    }
  } else if (filters.fromDate || filters.toDate) {
    match.createdAt = {};
    if (filters.fromDate) match.createdAt.$gte = new Date(filters.fromDate);
    if (filters.toDate) match.createdAt.$lte = new Date(filters.toDate);
  }

  return match;
}

export function buildConversationTagsPipeline(filters: IReportTagsFilters) {
  const match = buildConversationTagsMatch(filters);

  const pipeline: any[] = [{ $match: match }];

  if (filters.source && filters.source !== 'all') {
    const integrationKind = sourceMap[filters.source];
    if (integrationKind) {
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
        { $match: { 'integration.kind': integrationKind } },
        { $project: { tagIds: 1, status: 1 } },
      );
    }
  }

  pipeline.push(
    { $unwind: '$tagIds' },
    { $group: { _id: '$tagIds', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: filters.limit ?? 10 },
  );

  return pipeline;
}

export function buildConversationSourcesPipeline(filters: IReportTagsFilters) {
  const match = buildStatusMatch(filters);

  const pipeline: any[] = [
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
  ];

  if (filters.source && filters.source !== 'all') {
    const integrationKind = sourceMap[filters.source];
    if (integrationKind) {
      pipeline.push({ $match: { 'integration.kind': integrationKind } });
    }
  }

  pipeline.push(
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

  return pipeline;
}

export function buildSourceFilterPipeline(
  pipeline: any[],
  filters: IReportFilters,
  projectFields?: any,
) {
  if (filters.source && filters.source !== 'all') {
    const integrationKind = sourceMap[filters.source];
    console.log(
      'filters.source:',
      filters.source,
      'integrationKind:',
      integrationKind,
    );

    if (integrationKind) {
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
        { $match: { 'integration.kind': integrationKind } },
      );

      if (projectFields) {
        pipeline.push({ $project: projectFields });
      }
    }
  }
}
