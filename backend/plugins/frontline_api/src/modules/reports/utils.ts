import { IReportFilters } from '@/reports/@types/reportFilters';
import { IModels } from '~/connectionResolvers';

export const sourceMap: Record<string, string> = {
  'facebook-messenger': 'facebook-messenger',
  'facebook-post': 'facebook-post',
  'instagram-messenger': 'instagram-messenger',
  'instagram-post': 'instagram-post',
  call: 'call',
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

  const range: any = {};
  if (filters.fromDate) range.$gte = new Date(filters.fromDate);
  if (filters.toDate) range.$lte = new Date(filters.toDate);

  return { [field]: range };
}

export const normalizeStatus = (status?: string) => {
  if (!status) return null;
  return status.toLowerCase();
};

export function buildConversationMatch(filters: IReportFilters) {
  const match: any = {};

  const status = normalizeStatus(filters.status);
  if (status) match.status = status;

  if (filters.channelId?.length) {
    match.channelId = { $in: filters.channelId };
  }

  Object.assign(match, buildDateMatch(filters, 'createdAt'));

  return match;
}

export const buildConversationPipeline = async (
  filters: IReportFilters,
  models: IModels,
  options: { withPagination?: boolean } = {},
) => {
  const pipeline: any[] = [];
  const match = buildConversationMatch(filters);

  if (Object.keys(match).length) {
    pipeline.push({ $match: match });
  }

  if (filters.channelId?.length) {
    const integrations = await models.Integrations.find({
      channelId: { $in: filters.channelId },
    }).lean();

    if (!integrations.length) {
      pipeline.push({ $match: { _id: null } });
      return pipeline;
    }

    const integrationIds = integrations.map((i) => i._id);

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
      { $match: { 'integration._id': { $in: integrationIds } } },
    );
  }

  if (filters.source && sourceMap[filters.source]) {
    if (!filters.channelId?.length) {
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
      );
    }

    pipeline.push({
      $match: { 'integration.kind': sourceMap[filters.source] },
    });
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
