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
import {
  TICKET_DEFAULT_STATUSES,
  TICKET_PRIORITY_TYPES,
} from '@/ticket/constants/types';

type ReportPropertyCount = {
  _id: {
    fieldId: string;
    value: unknown;
  };
  count: number;
};

type ReportPropertyField = {
  _id: string;
  name?: string;
  text?: string;
  type?: string;
  options?: Array<{
    label?: string;
    value?: string;
  }>;
};

type ReportPropertyRow = {
  _id: string;
  name: string;
  count: number;
};

const OPTION_PROPERTY_TYPES = new Set(['select', 'multiSelect', 'radio']);

const getPrimitivePropertyValue = (value: unknown) => {
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return String(value);
  }

  return '';
};

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
      { $limit: filters.limit || 100 },
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
    const basePipeline = await buildTicketPipeline(filters, subdomain);

    basePipeline.push({ $sort: { updatedAt: -1, _id: -1 } });

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;

    const paginatedPipeline = [
      ...basePipeline,
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    const countPipeline = [...basePipeline, { $count: 'total' }];

    const [list, countResult] = await Promise.all([
      models.Ticket.aggregate(paginatedPipeline, { allowDiskUse: true }),
      models.Ticket.aggregate(countPipeline, { allowDiskUse: true }),
    ]);

    const totalCount = (countResult[0] as any)?.total ?? 0;

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
      { $limit: filters.limit ?? 100 },
    ];

    const tagCounts: Array<{ _id: any; count: number }> =
      await models.Ticket.aggregate(pipeline);

    if (!tagCounts.length) {
      return [];
    }

    const total = tagCounts.reduce((s, t) => s + t.count, 0);
    const tagIds = tagCounts.map((t) => t._id);

    const tags: Array<{ _id: any; name: string; colorCode?: string }> =
      await sendTRPCMessage({
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
      tags.map((t) => [
        t._id.toString(),
        { name: t.name, colorCode: t.colorCode },
      ]),
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

  async reportTicketCustomProperties(
    _parent: undefined,
    { filters = {} }: { filters?: IReportFilters },
    { models, subdomain }: IContext,
  ) {
    const matchFilter = buildTicketMatch(filters);

    const pipeline: any[] = [
      { $match: matchFilter },
      { $match: { $expr: { $eq: [{ $type: '$propertiesData' }, 'object'] } } },
      { $addFields: { __properties: { $objectToArray: '$propertiesData' } } },
      { $unwind: '$__properties' },
      ...(filters.propertyIds?.length
        ? [{ $match: { '__properties.k': { $in: filters.propertyIds } } }]
        : []),
      {
        $addFields: {
          __propertyValues: {
            $cond: [
              { $isArray: '$__properties.v' },
              '$__properties.v',
              ['$__properties.v'],
            ],
          },
        },
      },
      { $unwind: '$__propertyValues' },
      {
        $group: {
          _id: {
            fieldId: '$__properties.k',
            value: '$__propertyValues',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ];

    const propertyCounts: ReportPropertyCount[] = await models.Ticket.aggregate(
      pipeline,
    );

    if (!propertyCounts.length) {
      return [];
    }

    const fieldIds = Array.from(
      new Set(propertyCounts.map((p) => p._id.fieldId)),
    );

    const fields: ReportPropertyField[] = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'fields',
      action: 'find',
      input: {
        query: { _id: { $in: fieldIds } },
      },
      defaultValue: [],
    });

    const fieldMap = new Map<string, ReportPropertyField>(
      fields.map((f) => [f._id.toString(), f]),
    );

    const propertyRows = propertyCounts
      .map((p) => {
        const fieldId = p._id.fieldId?.toString();
        const field = fieldMap.get(fieldId);

        if (!field) {
          return null;
        }

        if (OPTION_PROPERTY_TYPES.has(field.type || '')) {
          const optionValue = getPrimitivePropertyValue(p._id.value);
          const option = field.options?.find(
            (fieldOption) => fieldOption.value === optionValue,
          );

          if (!optionValue) {
            return null;
          }
               const fieldLabel = field.name || field.text;
          const valueLabel = option?.label || optionValue;


          return {
            _id: `${fieldId}:${optionValue}`,
            name: fieldLabel ? `${fieldLabel}: ${valueLabel}` : valueLabel,
            count: p.count,
          };
        }

     
        return {
          _id: fieldId,
          name: field.name || field.text,
          count: p.count,
        };
      })
      .filter((property): property is ReportPropertyRow =>
        Boolean(property?.name),
      );

    const resolvedCounts = Array.from(
      propertyRows
        .reduce<Map<string, ReportPropertyRow>>((rows, row) => {
          const existingRow = rows.get(row._id);

          rows.set(row._id, {
            ...row,
            count: (existingRow?.count || 0) + row.count,
          });

          return rows;
        }, new Map())
        .values(),
    )
      .sort((a, b) => b.count - a.count)
      .slice(0, filters.limit ?? 100);

    const total = resolvedCounts.reduce((s, p) => s + p.count, 0);

    return resolvedCounts.map((p) => ({
      _id: p._id,
      name: p.name,
      count: p.count,
      percentage: calculatePercentage(p.count, total),
    }));
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

    const countMap = Object.fromEntries(
      priorityCounts.map((r: any) => [r._id, r.count]),
    );

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

  async reportTicketExport(
    _parent: undefined,
    { filters = {} }: { filters?: IReportFilters },
    { models, subdomain }: IContext,
  ) {
    const pipeline = await buildTicketPipeline(filters, subdomain);
    pipeline.push({ $sort: { createdAt: -1 } });

    const tickets = await models.Ticket.aggregate(pipeline);

    if (!tickets.length) {
      return [];
    }

    const assigneeIds = [
      ...new Set(tickets.map((t: any) => t.assigneeId).filter(Boolean)),
    ];
    const pipelineIds = [
      ...new Set(tickets.map((t: any) => t.pipelineId).filter(Boolean)),
    ];
    const allTagIds = [...new Set(tickets.flatMap((t: any) => t.tagIds || []))];

    const [members, pipelines, tags] = await Promise.all([
      assigneeIds.length
        ? sendTRPCMessage({
            subdomain,
            pluginName: 'core',
            method: 'query',
            module: 'users',
            action: 'find',
            input: { query: { _id: { $in: assigneeIds } } },
            defaultValue: [],
          })
        : [],
      pipelineIds.length
        ? models.Pipeline.find({ _id: { $in: pipelineIds } }).lean()
        : [],
      allTagIds.length
        ? sendTRPCMessage({
            subdomain,
            pluginName: 'core',
            method: 'query',
            module: 'tags',
            action: 'find',
            input: { query: { _id: { $in: allTagIds } } },
            defaultValue: [],
          })
        : [],
    ]);

    const memberMap = new Map(
      (members as any[]).map((m: any) => [
        m._id.toString(),
        m.details?.fullName || m.email || 'Unknown',
      ]),
    );
    const pipelineMap = new Map(
      (pipelines as any[]).map((p: any) => [p._id.toString(), p.name]),
    );
    const tagMap = new Map(
      (tags as any[]).map((t: any) => [t._id.toString(), t.name]),
    );

    const statusMap = new Map(
      TICKET_DEFAULT_STATUSES.map((s) => [s.type, s.name]),
    );
    const priorityMap = new Map(
      TICKET_PRIORITY_TYPES.map((p) => [p.type, p.name]),
    );

    return tickets.map((ticket: any) => ({
      _id: ticket._id,
      name: ticket.name,
      state: ticket.state || 'active',
      priorityLabel: priorityMap.get(ticket.priority) || 'No Priority',
      statusLabel: statusMap.get(ticket.statusType) || 'Unknown',
      assigneeName: ticket.assigneeId
        ? memberMap.get(ticket.assigneeId.toString()) || 'Unknown'
        : 'Unassigned',
      pipelineName: ticket.pipelineId
        ? pipelineMap.get(ticket.pipelineId.toString()) || 'Unknown'
        : '',
      tagNames: (ticket.tagIds || []).map(
        (id: string) => tagMap.get(id.toString()) || 'Unknown',
      ),
      createdAt: ticket.createdAt,
      startDate: ticket.startDate,
      targetDate: ticket.targetDate,
      updatedAt: ticket.updatedAt,
    }));
  },
};
