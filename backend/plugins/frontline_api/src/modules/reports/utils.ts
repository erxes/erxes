import type { FilterQuery, PipelineStage } from 'mongoose';
import type { IConversationDocument } from '@/inbox/@types/conversations';
import type { IIntegrationDocument } from '@/inbox/@types/integrations';
import type { ITicketDocument } from '@/ticket/@types/ticket';
import { buildAssigneeFilter } from '@/inbox/utils/conversationAssignees';
import { propertyDataPath } from 'erxes-api-shared/core-modules';
import { IReportChartFilters } from '@/reports/@types/chart';
import { IReportFilters } from '@/reports/@types/reportFilters';
import { IModels } from '~/connectionResolvers';
import { escapeRegExp } from 'erxes-api-shared/utils';

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
  field: 'createdAt' | 'closedAt' | 'statusChangedDate' | 'updatedAt',
) {
  if (!filters.fromDate && !filters.toDate) return {};

  const range: { $gte?: Date; $lte?: Date } = {};
  if (filters.fromDate) range.$gte = new Date(filters.fromDate);
  if (filters.toDate) range.$lte = new Date(filters.toDate);

  if (Object.values(range).some((date) => Number.isNaN(date.getTime()))) {
    throw new Error(`Invalid ${field} date range`);
  }
  if (range.$gte && range.$lte && range.$gte > range.$lte) {
    throw new Error(`The ${field} start date must precede the end date`);
  }

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
): Promise<FilterQuery<IConversationDocument>> {
  const status = options.statusOverride ?? normalizeStatus(filters.status);
  const match: FilterQuery<IConversationDocument> = {
    status: status || { $nin: ['archived', 'deleted'] },
    ...buildDateMatch(filters, options.dateField ?? 'createdAt'),
  };

  // Keep the report aligned with the inbox without removing historical data.
  const integrationFilter: FilterQuery<IIntegrationDocument> = {
    isActive: { $ne: false },
  };
  if (filters.channelIds?.length) {
    integrationFilter.channelId = { $in: filters.channelIds };
  }
  if (filters.source && sourceMap[filters.source]) {
    integrationFilter.kind = sourceMap[filters.source];
  }
  const integrations = await models.Integrations.find(integrationFilter, {
    _id: 1,
  }).lean();
  match.integrationId = { $in: integrations.map(({ _id }) => _id) };

  if (filters.memberIds?.length) {
    Object.assign(match, buildAssigneeFilter(filters.memberIds));
  }

  if (status === 'archived' || status === 'deleted') {
    match._id = { $in: [] };
  } else if (filters.callStatus && filters.source === 'calls') {
    const histories = await models.CallHistory.find(
      { callStatus: filters.callStatus },
      { conversationId: 1 },
    ).lean();
    match._id = {
      $in: histories
        .map(({ conversationId }) => conversationId)
        .filter(Boolean),
    };
  }

  return match;
}

export const buildConversationPipeline = async (
  filters: IReportFilters,
  models: IModels,
  options: { withPagination?: boolean } = {},
) => {
  const pipeline: PipelineStage[] = [];
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
  extraMatch?: FilterQuery<IConversationDocument>,
): Promise<Array<{ date: string; count: number }>> {
  const pipeline = await buildConversationPipeline(filters, models);

  if (extraMatch) {
    pipeline.unshift({ $match: extraMatch });
  }

  pipeline.push(...buildDateGroupPipeline(dateField));

  if (filters.limit) {
    pipeline.push({ $limit: filters.limit });
  }

  const result = await models.Conversations.aggregate<{
    _id: string;
    count: number;
  }>(pipeline);
  return result.map((r) => ({ date: r._id, count: r.count }));
}

export async function buildConversationResponsesPipeline(
  filters: IReportFilters,
  models: IModels,
): Promise<PipelineStage[]> {
  // A response only counts while its parent conversation still belongs in reports.
  // The date range applies to the message, not the conversation's creation date.
  const conversationMatch = await generateConversationReportFilter(
    { ...filters, fromDate: undefined, toDate: undefined },
    models,
  );
  return [
    {
      $match: {
        internal: false,
        userId: { $exists: true, $ne: null },
        ...buildDateMatch(filters, 'createdAt'),
      },
    },
    {
      $lookup: {
        from: models.Conversations.collection.name,
        let: { conversationId: '$conversationId' },
        pipeline: [
          {
            $match: {
              ...conversationMatch,
              $expr: { $eq: ['$_id', '$$conversationId'] },
            },
          },
        ],
        as: 'conversation',
      },
    },
    { $unwind: '$conversation' },
  ];
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

export function buildDateGroupPipeline(
  field: string,
  frequency?: string,
): PipelineStage[] {
  const freq = frequency?.toLowerCase();

  let groupId: Record<string, unknown>;
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
    { $sort: { _id: -1 } },
  ];
}

export function buildConversationMatch(filters: IReportFilters) {
  const match: Record<string, unknown> = {};

  const status = normalizeStatus(filters.status);
  if (status) match.status = status;

  Object.assign(match, buildDateMatch(filters, 'createdAt'));

  return match;
}

type TicketMatch = FilterQuery<ITicketDocument>;
type TicketPropertyFilter = NonNullable<
  IReportFilters['propertyValueFilters']
>[number];

function applyTicketStatusFilters(
  match: TicketMatch,
  andConditions: TicketMatch[],
  filters: IReportFilters,
): void {
  if (filters.status) {
    match.statusId = filters.status;
  }

  if (filters.statusIds?.length) {
    match.statusId = { $in: filters.statusIds };
  }

  const state = filters.state || 'active';

  if (state !== 'all') {
    if (state === 'active') {
      andConditions.push({
        $or: [{ state: 'active' }, { state: { $exists: false } }],
      });
    } else {
      match.state = state;
    }
  }
}

function applyTicketSelectionFilters(
  match: TicketMatch,
  filters: IReportFilters,
): void {
  const selections = [
    ['channelId', filters.channelIds],
    ['assigneeId', filters.memberIds],
    ['statusChangedBy', filters.statusChangedByIds],
    ['updatedBy', filters.updatedByIds],
    ['pipelineId', filters.pipelineIds],
    ['tagIds', filters.tagIds],
    ['branchId', filters.branchIds],
  ] as const;

  for (const [field, values] of selections) {
    if (values?.length) {
      match[field] = { $in: values };
    }
  }
}

function applyTicketPriorityFilter(
  match: TicketMatch,
  andConditions: TicketMatch[],
  filters: IReportFilters,
): void {
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
}

function buildTicketPropertyDateCondition(
  fieldPath: string,
  values: string[],
): TicketMatch | null {
  const dateValues = values.filter((value) =>
    /^\d{4}-\d{2}-\d{2}$/.test(value),
  );

  if (!dateValues.length) {
    return null;
  }

  const dateStringExpression = {
    $dateToString: {
      date: {
        $convert: {
          input: `$${fieldPath}`,
          to: 'date',
          onError: null,
          onNull: null,
        },
      },
      format: '%Y-%m-%d',
      timezone: process.env.TZ || 'Asia/Ulaanbaatar',
    },
  };

  if (dateValues.length > 1) {
    const [fromDateKey, toDateKey] = dateValues
      .slice(0, 2)
      .sort((a, b) => a.localeCompare(b));

    return {
      $or: [
        {
          [fieldPath]: {
            $gte: fromDateKey,
            $lte: `${toDateKey}T23:59:59.999Z`,
          },
        },
        {
          $expr: {
            $and: [
              { $gte: [dateStringExpression, fromDateKey] },
              { $lte: [dateStringExpression, toDateKey] },
            ],
          },
        },
      ],
    };
  }

  const [year, month, day] = dateValues[0].split('-').map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const dateKey = [
    year.toString().padStart(4, '0'),
    month.toString().padStart(2, '0'),
    day.toString().padStart(2, '0'),
  ].join('-');

  return {
    $or: [
      { [fieldPath]: { $regex: `^${escapeRegExp(dateKey)}` } },
      {
        $expr: {
          $eq: [dateStringExpression, dateKey],
        },
      },
    ],
  };
}

function buildTicketPropertyConditions(
  propertyFilter: TicketPropertyFilter,
): TicketMatch[] {
  if (!propertyFilter.propertyId) {
    return [];
  }

  const fieldPath = propertyDataPath(propertyFilter.propertyId);
  const values = propertyFilter.values || [];

  if (!values.length) {
    return [];
  }

  if (propertyFilter.type === 'date') {
    const condition = buildTicketPropertyDateCondition(fieldPath, values);
    return condition ? [condition] : [];
  }

  if (
    propertyFilter.type === 'select' ||
    propertyFilter.type === 'multiSelect' ||
    propertyFilter.type === 'radio'
  ) {
    return [{ [fieldPath]: { $in: values } }];
  }

  return values.map((value) => ({ [fieldPath]: { $all: [value] } }));
}

function applyTicketDateFilters(
  match: TicketMatch,
  filters: IReportFilters,
): void {
  if (filters.startDate) {
    match.startDate = { $gte: new Date(filters.startDate) };
  }

  if (filters.targetDate) {
    match.targetDate = { $lte: new Date(filters.targetDate) };
  }

  Object.assign(match, buildDateMatch(filters, 'createdAt'));
  Object.assign(
    match,
    buildDateMatch(
      {
        fromDate: filters.statusChangedFromDate,
        toDate: filters.statusChangedToDate,
      },
      'statusChangedDate',
    ),
  );
  Object.assign(
    match,
    buildDateMatch(
      {
        fromDate: filters.updatedFromDate,
        toDate: filters.updatedToDate,
      },
      'updatedAt',
    ),
  );
}

export function buildTicketMatch(filters: IReportFilters): TicketMatch {
  const match: TicketMatch = { type: 'ticket' };
  const andConditions: TicketMatch[] = [];

  applyTicketStatusFilters(match, andConditions, filters);
  applyTicketSelectionFilters(match, filters);

  const description = filters.description?.trim();
  if (description) {
    match.description = {
      $regex: escapeRegExp(description),
      $options: 'i',
    };
  }

  applyTicketPriorityFilter(match, andConditions, filters);
  andConditions.push(
    ...(filters.propertyValueFilters || []).flatMap(
      buildTicketPropertyConditions,
    ),
  );
  applyTicketDateFilters(match, filters);

  if (andConditions.length) {
    match.$and = andConditions;
  }

  return match;
}

// Report contact filters: tickets keep their customer and company
// themselves, so a filter of several contacts matches either of them.
export function narrowTicketMatchByContacts(
  match: TicketMatch,
  filters: IReportFilters,
) {
  if (filters.customerIds?.length) {
    match.customerId = { $in: filters.customerIds };
  }

  if (filters.companyIds?.length) {
    match.companyId = { $in: filters.companyIds };
  }

  return match;
}

export const buildTicketPipeline = (
  filters: IReportFilters,
): PipelineStage[] => {
  const match = narrowTicketMatchByContacts(buildTicketMatch(filters), filters);

  return [{ $match: match }];
};

export function buildTicketTagMatch(filters: IReportFilters) {
  const match = buildTicketMatch(filters);
  match.tagIds = { $exists: true, $ne: [] };
  return match;
}

const REPORT_CHART_FILTER_KEYS = [
  'statusChangedDate',
  'updatedAtDate',
  'statusChangedFromDate',
  'statusChangedToDate',
  'updatedFromDate',
  'updatedToDate',
  'description',
  'statusChangedByIds',
  'updatedByIds',
  'date',
  'fromDate',
  'toDate',
  'status',
  'statusIds',
  'source',
  'state',
  'frequency',
  'startDate',
  'targetDate',
  'groupPropertyId',
  'channelIds',
  'memberIds',
  'pipelineIds',
  'tagIds',
  'customerIds',
  'companyIds',
  'branchIds',
  'pageIds',
  'searchValue',
  'propertyIds',
  'priority',
  'propertyValueFilters',
] as const satisfies readonly (keyof IReportChartFilters)[];

export function pickReportChartFilters(
  filters?: IReportFilters,
): IReportChartFilters {
  const picked: IReportChartFilters = {};

  if (!filters) {
    return picked;
  }

  for (const key of REPORT_CHART_FILTER_KEYS) {
    const value = filters[key];

    if (value === undefined || value === null) {
      continue;
    }

    if (typeof value === 'string' && !value.trim()) {
      continue;
    }

    if (Array.isArray(value) && !value.length) {
      continue;
    }

    Object.assign(picked, { [key]: value });
  }

  if (picked.propertyValueFilters) {
    const propertyValueFilters = picked.propertyValueFilters.filter(
      (propertyFilter) =>
        propertyFilter?.propertyId && propertyFilter.values?.length,
    );

    if (propertyValueFilters.length) {
      picked.propertyValueFilters = propertyValueFilters;
    } else {
      delete picked.propertyValueFilters;
    }
  }

  return picked;
}
