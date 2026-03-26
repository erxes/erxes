import { IContext } from '~/connectionResolvers';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IReportFilters } from '@/reports/@types/reportFilters';
import {
  calculatePercentage,
  buildTicketMatch,
  buildTicketPipeline,
  buildTicketTagMatch,
  buildDateGroupPipeline,
} from '@/reports/utils';
import { TICKET_DEFAULT_STATUSES, TICKET_PRIORITY_TYPES } from '@/ticket/constants/types';

export const reportTicketQueries = {
  async reportTicketSource(
    _parent: undefined,
    { filters = {} }: { filters?: IReportFilters },
    { models, subdomain }: IContext,
  ) {
    const matchFilter = buildTicketMatch(filters);

    const tickets = await models.Ticket.find(matchFilter, { _id: 1 }).lean();

    if (!tickets.length) {
      return [];
    }

    const ticketIds = tickets.map((t) => t._id.toString());

    const conversationIds: string[] = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'relation',
      action: 'filterRelationIds',
      input: {
        contentType: 'frontline:ticket',
        contentIds: ticketIds,
        relatedContentType: 'frontline:conversation',
      },
      defaultValue: [],
    });

    if (!conversationIds.length) {
      return [];
    }

    const pipeline: any[] = [
      { $match: { _id: { $in: conversationIds } } },
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
      { $limit: filters.limit || 10 },
    ];

    const sources = await models.Conversations.aggregate(pipeline);

    const total = sources.reduce((s: number, i: any) => s + i.count, 0);

    return sources.map((s: any) => ({
      _id: s._id,
      name: s.name || s._id,
      count: s.count,
      percentage: calculatePercentage(s.count, total),
    }));
  },

  async reportTicketDate(
    _parent,
    { filters = {} }: { filters?: IReportFilters },
    { models, subdomain },
  ) {
    const pipeline = await buildTicketPipeline(filters, subdomain);

    pipeline.push(...buildDateGroupPipeline('createdAt', filters.frequency));

    const result = await models.Ticket.aggregate(pipeline);

    return result.map((r) => ({ date: r._id, count: r.count }));
  },

  async reportTicketOpen(_parent, { filters = {} }, { models }) {
    const query = buildTicketMatch(filters);
    const baseQuery = buildTicketMatch({
      ...filters,
      status: undefined,
    });

    const [openCount, totalCount] = await Promise.all([
      models.Ticket.countDocuments(query),
      models.Ticket.countDocuments(baseQuery),
    ]);

    return {
      count: openCount,
      percentage: calculatePercentage(openCount, totalCount),
    };
  },

  async reportTicketList(
    _parent,
    { filters = {} }: { filters?: IReportFilters },
    { models, subdomain },
  ) {
    const pipeline = await buildTicketPipeline(filters, subdomain);

    pipeline.push({ $sort: { updatedAt: -1 } });

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    pipeline.push({ $skip: skip }, { $limit: limit });

    const query = buildTicketMatch(filters);

    const [list, totalCount] = await Promise.all([
      models.Ticket.aggregate(pipeline),
      models.Ticket.countDocuments(query),
    ]);

    return {
      list,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    };
  },

  async reportTicketTotalCount(
    _parent: undefined,
    { filters = {} }: { filters?: IReportFilters },
    { models, subdomain }: IContext,
  ) {
    const pipeline = await buildTicketPipeline(filters, subdomain);
    pipeline.push({ $count: 'total' });
    const result = await models.Ticket.aggregate(pipeline);
    return result[0]?.total ?? 0;
  },

  async reportTicketTags(
    _parent: undefined,
    { filters = {} }: { filters?: IReportFilters },
    { models, subdomain }: IContext,
  ) {
    const matchFilter = buildTicketTagMatch(filters);

    const pipeline: any[] = [
      { $match: matchFilter },
      { $unwind: '$tagIds' },
      { $group: { _id: '$tagIds', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: filters.limit ?? 10 },
    ];

    const tagCounts: Array<{ _id: any; count: number }> = await models.Ticket.aggregate(pipeline);

    if (!tagCounts.length) {
      return [];
    }

    const total = tagCounts.reduce((s, t) => s + t.count, 0);
    const tagIds = tagCounts.map((t) => t._id);

    const tags: Array<{ _id: any; name: string; colorCode?: string }> = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'tags',
      action: 'find',
      input: {
        query: { _id: { $in: tagIds } },
      },
      defaultValue: [],
    });

    const tagMap = new Map<string, { name: string; colorCode?: string }>(
      tags.map((t) => [t._id.toString(), { name: t.name, colorCode: t.colorCode }]),
    );

    return tagCounts.map((tag) => {
      const info = tagMap.get(tag._id.toString());

      return {
        _id: tag._id,
        name: info?.name ?? 'Unknown Tag',
        colorCode: info?.colorCode ?? '#000',
        count: tag.count,
        percentage: calculatePercentage(tag.count, total),
      };
    });
  },

  async reportTicketStatusSummary(
    _parent: undefined,
    { filters = {} }: { filters?: IReportFilters },
    { models }: IContext,
  ) {
    const matchFilter = buildTicketMatch(filters);

    const pipeline: any[] = [
      { $match: matchFilter },
      {
        $group: {
          _id: { $ifNull: ['$statusType', 0] },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const statusCounts = await models.Ticket.aggregate(pipeline);

    const total = statusCounts.reduce((s: number, r: any) => s + r.count, 0);

    return TICKET_DEFAULT_STATUSES.map((defaultStatus) => {
      const found = statusCounts.find((r: any) => r._id === defaultStatus.type);
      const count = found?.count ?? 0;

      return {
        statusType: defaultStatus.type,
        name: defaultStatus.name,
        color: defaultStatus.color,
        count,
        percentage: calculatePercentage(count, total),
      };
    });
  },

  async reportTicketPriority(
    _parent: undefined,
    { filters = {} }: { filters?: IReportFilters },
    { models }: IContext,
  ) {
    const matchFilter = buildTicketMatch(filters);
    const pipeline: any[] = [
      { $match: matchFilter },
      {
        $group: {
          _id: { $ifNull: ['$priority', 0] },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const priorityCounts = await models.Ticket.aggregate(pipeline);

    const total = priorityCounts.reduce((s: number, r: any) => s + r.count, 0);

    const countMap = Object.fromEntries(priorityCounts.map((r: any) => [r._id, r.count]));

    return TICKET_PRIORITY_TYPES.map((p) => {
      const count = countMap[p.type] ?? 0;

      return {
        priority: p.type,
        name: p.name,
        color: p.color,
        count,
        percentage: calculatePercentage(count, total),
      };
    });
  },
};
