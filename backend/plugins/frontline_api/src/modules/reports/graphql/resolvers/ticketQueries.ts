import { IContext } from '~/connectionResolvers';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IReportFilters } from '@/reports/@types/reportFilters';
import {
  calculatePercentage,
  buildTicketMatch,
  buildTicketPipeline,
  buildTicketTagMatch,
  buildDateGroupPipeline,
  narrowTicketMatchByContacts,
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

const NO_PRIORITY_TYPE = { name: 'no priority', type: 0, color: '#9CA3AF' };

type StatusSummaryRow = {
  _id: string | null;
  statusType: number;
  name: string;
  group: string | null;
  color: string;
  order: number;
  count: number;
};

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

async function reportTicketCustomPropertiesGrouped({
  models,
  subdomain,
  matchFilter,
  filters,
  groupPropertyId,
}: {
  models: IContext['models'];
  subdomain: string;
  matchFilter: any;
  filters: IReportFilters;
  groupPropertyId: string;
}) {
  const pipeline: any[] = [
    { $match: matchFilter },
    { $match: { $expr: { $eq: [{ $type: '$propertiesData' }, 'object'] } } },
    { $addFields: { __allProps: { $objectToArray: '$propertiesData' } } },
    {
      $addFields: {
        __raw: {
          $let: {
            vars: {
              g: {
                $first: {
                  $filter: {
                    input: '$__allProps',
                    as: 'p',
                    cond: { $eq: ['$$p.k', groupPropertyId] },
                  },
                },
              },
            },
            in: '$$g.v',
          },
        },
      },
    },
    {
      $addFields: {
        __values: {
          $cond: [{ $isArray: '$__raw' }, '$__raw', ['$__raw']],
        },
      },
    },
    { $unwind: '$__values' },
    { $match: { __values: { $nin: [null, ''] } } },
    { $group: { _id: '$__values', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: filters.limit ?? 100 },
  ];

  const valueCounts: Array<{ _id: unknown; count: number }> =
    await models.Ticket.aggregate(pipeline);

  if (!valueCounts.length) {
    return [];
  }

  const fields: ReportPropertyField[] = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'fields',
    action: 'find',
    input: {
      query: { _id: { $in: [groupPropertyId] } },
    },
    defaultValue: [],
  });

  const groupField = fields.find((f) => f._id.toString() === groupPropertyId);

  const resolveOptionLabel = (primitive: string) => {
    const option = groupField?.options?.find((o) => o.value === primitive);
    return option?.label || primitive;
  };

  const rows = valueCounts
    .map((entry): ReportPropertyRow | null => {
      const primitive = getPrimitivePropertyValue(entry._id);

      if (!primitive) {
        return null;
      }

      return {
        _id: primitive,
        name: resolveOptionLabel(primitive),
        count: entry.count,
      };
    })
    .filter((row): row is ReportPropertyRow => Boolean(row?.name));

  const mergedRows = Array.from(
    rows
      .reduce<Map<string, ReportPropertyRow>>((map, row) => {
        const existingRow = map.get(row._id);

        map.set(row._id, {
          ...row,
          count: (existingRow?.count || 0) + row.count,
        });

        return map;
      }, new Map())
      .values(),
  ).sort((a, b) => b.count - a.count);

  const total = mergedRows.reduce((sum, row) => sum + row.count, 0);

  return mergedRows.map((row) => ({
    _id: row._id,
    name: row.name,
    count: row.count,
    percentage: calculatePercentage(row.count, total),
  }));
}

async function reportTicketFieldsForGroupValue({
  models,
  subdomain,
  matchFilter,
  filters,
  groupPropertyId,
  groupPropertyValue,
}: {
  models: IContext['models'];
  subdomain: string;
  matchFilter: any;
  filters: IReportFilters;
  groupPropertyId: string;
  groupPropertyValue: string;
}) {
  const pipeline: any[] = [
    { $match: matchFilter },
    { $match: { $expr: { $eq: [{ $type: '$propertiesData' }, 'object'] } } },
    { $addFields: { __allProps: { $objectToArray: '$propertiesData' } } },
    {
      $addFields: {
        __groupRaw: {
          $let: {
            vars: {
              g: {
                $first: {
                  $filter: {
                    input: '$__allProps',
                    as: 'p',
                    cond: { $eq: ['$$p.k', groupPropertyId] },
                  },
                },
              },
            },
            in: '$$g.v',
          },
        },
      },
    },
    {
      $addFields: {
        __groupValues: {
          $cond: [{ $isArray: '$__groupRaw' }, '$__groupRaw', ['$__groupRaw']],
        },
      },
    },
    { $match: { __groupValues: groupPropertyValue } },
    {
      $addFields: {
        __props: {
          $filter: {
            input: '$__allProps',
            as: 'p',
            cond: {
              $and: [
                { $ne: ['$$p.k', groupPropertyId] },
                { $ne: ['$$p.v', null] },
                { $ne: ['$$p.v', ''] },
              ],
            },
          },
        },
      },
    },
    { $unwind: '$__props' },
    {
      $addFields: {
        __vals: {
          $cond: [{ $isArray: '$__props.v' }, '$__props.v', ['$__props.v']],
        },
      },
    },
    { $unwind: '$__vals' },
    {
      $group: {
        _id: { fieldId: '$__props.k', value: '$__vals' },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ];

  const valueCounts: ReportPropertyCount[] =
    await models.Ticket.aggregate(pipeline);

  if (!valueCounts.length) {
    return [];
  }

  const fieldIds = Array.from(new Set(valueCounts.map((p) => p._id.fieldId)));

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

  type GroupedRow = ReportPropertyRow & { group: string };

  const optionRows: GroupedRow[] = [];
  const nonOptionTotals = new Map<string, GroupedRow>();

  for (const entry of valueCounts) {
    const fieldId = entry._id.fieldId?.toString();
    const field = fieldMap.get(fieldId);
    const fieldLabel = field?.name || field?.text || 'Unknown Property';

    if (field && OPTION_PROPERTY_TYPES.has(field.type || '')) {
      const primitive = getPrimitivePropertyValue(entry._id.value);

      if (!primitive) {
        continue;
      }

      const option = field.options?.find((o) => o.value === primitive);

      optionRows.push({
        _id: `${fieldId}:${primitive}`,
        name: option?.label || primitive,
        group: fieldLabel,
        count: entry.count,
      });
    } else {
      const existing = nonOptionTotals.get(fieldId) || {
        _id: fieldId,
        name: fieldLabel,
        group: fieldLabel,
        count: 0,
      };
      existing.count += entry.count;
      nonOptionTotals.set(fieldId, existing);
    }
  }

  const rows = [...optionRows, ...Array.from(nonOptionTotals.values())];

  if (!rows.length) {
    return [];
  }

  const total = rows.reduce((sum, row) => sum + row.count, 0);

  const groupTotals = rows.reduce<Map<string, number>>((totals, row) => {
    totals.set(row.group, (totals.get(row.group) || 0) + row.count);
    return totals;
  }, new Map());

  rows.sort((a, b) => {
    const groupDiff =
      (groupTotals.get(b.group) || 0) - (groupTotals.get(a.group) || 0);

    if (groupDiff !== 0) {
      return groupDiff;
    }

    if (a.group !== b.group) {
      return a.group < b.group ? -1 : 1;
    }

    return b.count - a.count;
  });

  return rows.slice(0, filters.limit ?? 200).map((row) => ({
    _id: row._id,
    name: row.name,
    group: row.group,
    count: row.count,
    percentage: calculatePercentage(row.count, total),
  }));
}

export const reportTicketQueries = {
  async reportTicketSource(
    _parent: undefined,
    { filters = {} }: { filters?: IReportFilters },
    { models, subdomain }: IContext,
  ) {
    const matchFilter = await narrowTicketMatchByContacts(
      buildTicketMatch(filters),
      filters,
      subdomain,
    );

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

  async reportTicketOpen(_parent, { filters = {} }, { models, subdomain }) {
    const query = await narrowTicketMatchByContacts(
      buildTicketMatch(filters),
      filters,
      subdomain,
    );
    const baseQuery = await narrowTicketMatchByContacts(
      buildTicketMatch({
        ...filters,
        status: undefined,
      }),
      filters,
      subdomain,
    );

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
    const matchFilter = await narrowTicketMatchByContacts(
      buildTicketTagMatch(filters),
      filters,
      subdomain,
    );

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
    const matchFilter = await narrowTicketMatchByContacts(
      buildTicketMatch(filters),
      filters,
      subdomain,
    );

    if (filters.groupPropertyId) {
      if (filters.groupPropertyValue) {
        return reportTicketFieldsForGroupValue({
          models,
          subdomain,
          matchFilter,
          filters,
          groupPropertyId: filters.groupPropertyId,
          groupPropertyValue: filters.groupPropertyValue,
        });
      }

      return reportTicketCustomPropertiesGrouped({
        models,
        subdomain,
        matchFilter,
        filters,
        groupPropertyId: filters.groupPropertyId,
      });
    }

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

    const propertyCounts: ReportPropertyCount[] =
      await models.Ticket.aggregate(pipeline);

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
    { models, subdomain }: IContext,
  ) {
    const matchFilter = await narrowTicketMatchByContacts(
      buildTicketMatch(filters),
      filters,
      subdomain,
    );

    const pipeline: any[] = [
      { $match: matchFilter },
      {
        $group: {
          _id: {
            statusId: '$statusId',
            statusType: { $ifNull: ['$statusType', 0] },
          },
          count: { $sum: 1 },
        },
      },
    ];

    const statusCounts: Array<{
      _id: { statusId?: string; statusType: number };
      count: number;
    }> = await models.Ticket.aggregate(pipeline);

    const statusIds = statusCounts
      .map((statusCount) => statusCount._id.statusId)
      .filter((statusId): statusId is string => Boolean(statusId));

    const statuses = statusIds.length
      ? await models.Status.find({ _id: { $in: statusIds } }).lean()
      : [];

    const statusById = new Map(statuses.map((status) => [status._id, status]));
    const categoryByType = new Map(
      TICKET_DEFAULT_STATUSES.map((category) => [category.type, category]),
    );

    const rows = new Map<string, StatusSummaryRow>();

    let total = 0;

    for (const { _id, count } of statusCounts) {
      total += count;

      const status = _id.statusId ? statusById.get(_id.statusId) : undefined;
      const statusType = status?.type ?? _id.statusType;
      const category = categoryByType.get(statusType);
      const key = status ? `status:${status._id}` : `category:${statusType}`;
      const existing = rows.get(key);

      if (existing) {
        existing.count += count;
        continue;
      }

      rows.set(key, {
        _id: status?._id ?? null,
        statusType,
        name: status?.name || category?.name || 'unknown',
        color: category?.color || status?.color || '#6B7280',
        group: status ? (category?.name ?? null) : null,
        order: status?.order ?? 0,
        count,
      });
    }

    return [...rows.values()]
      .sort((a, b) => a.statusType - b.statusType || a.order - b.order)
      .map((row) => ({
        _id: row._id,
        statusType: row.statusType,
        name: row.name,
        group: row.group,
        color: row.color,
        count: row.count,
        percentage: calculatePercentage(row.count, total),
      }));
  },

  async reportTicketPriority(
    _parent: undefined,
    { filters = {} }: { filters?: IReportFilters },
    { models, subdomain }: IContext,
  ) {
    const matchFilter = await narrowTicketMatchByContacts(
      buildTicketMatch(filters),
      filters,
      subdomain,
    );
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

    return [NO_PRIORITY_TYPE, ...TICKET_PRIORITY_TYPES].map((p) => {
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
