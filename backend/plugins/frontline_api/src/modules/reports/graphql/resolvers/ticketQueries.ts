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

export const reportTicketQueries = {
  async reportTicketSource(
    _parent: undefined,
    { filters = {} }: { filters?: IReportFilters },
    { models }: IContext,
  ) {
    const matchFilter = await buildTicketMatch(filters);

    const pipeline: any[] = [
      { $match: matchFilter },

      {
        $lookup: {
          from: 'relations',
          let: { ticketId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ['$$ticketId', '$entities.contentId'] },
                    { $in: ['frontline:ticket', '$entities.contentType'] },
                  ],
                },
              },
            },
            { $unwind: '$entities' },
            {
              $match: {
                'entities.contentType': 'frontline:conversation',
              },
            },
          ],
          as: 'relation',
        },
      },

      { $unwind: '$relation' },

      {
        $lookup: {
          from: 'conversations',
          localField: 'relation.entities.contentId',
          foreignField: '_id',
          as: 'conversation',
        },
      },
      { $unwind: '$conversation' },

      {
        $lookup: {
          from: 'integrations',
          localField: 'conversation.integrationId',
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

    const sources = await models.Ticket.aggregate(pipeline);

    const total = sources.reduce((s, i) => s + i.count, 0);

    return sources.map((s) => ({
      _id: s._id,
      name: s.name || s._id,
      count: s.count,
      percentage: calculatePercentage(s.count, total),
    }));
  },

  async reportTicketOpenDate(
    _parent,
    { filters = {} }: { filters?: IReportFilters },
    { models },
  ) {
    const pipeline = await buildTicketPipeline(filters);

    pipeline.push(...buildDateGroupPipeline('createdAt'));

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
    { models },
  ) {
    const pipeline = await buildTicketPipeline(filters);

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

  async reportTicketTags(
    _parent: undefined,
    { filters = {} }: { filters?: IReportFilters },
    { models, subdomain }: IContext,
  ) {
    const matchFilter = buildTicketTagMatch(filters);

    const pipeline: any[] = [
      { $match: matchFilter },

      {
        $lookup: {
          from: 'relations',
          let: { ticketId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ['$$ticketId', '$entities.contentId'] },
                    { $in: ['frontline:ticket', '$entities.contentType'] },
                  ],
                },
              },
            },
            { $unwind: '$entities' },
            {
              $match: {
                'entities.contentType': 'frontline:conversation',
              },
            },
          ],
          as: 'relation',
        },
      },

      { $unwind: '$relation' },

      {
        $lookup: {
          from: 'conversations',
          localField: 'relation.entities.contentId',
          foreignField: '_id',
          as: 'conversation',
        },
      },
      { $unwind: '$conversation' },

      { $unwind: '$conversation.tagIds' },
      { $group: { _id: '$conversation.tagIds', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: filters.limit ?? 10 },
    ];

    const tagCounts = await models.Ticket.aggregate(pipeline);

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

    const tagMap = new Map(tags.map((t: any) => [t._id.toString(), t.name]));

    return tagCounts.map((tag) => ({
      _id: tag._id,
      name: tagMap.get(tag._id.toString()) || 'Unknown Tag',
      colorCode: tag.colorCode || '#000',
      count: tag.count,
      percentage: calculatePercentage(tag.count, total),
    }));
  },
};
