import {
  GetExportData,
  IImportExportContext,
  buildExportCursorQuery,
} from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { buildTicketExportRow } from './buildTicketExportRow';

type TSystemFieldCondition = {
  key: string;
  operator: string;
  value?: unknown;
};

const TICKET_DATE_FIELDS = new Set([
  'startDate',
  'targetDate',
  'createdAt',
  'updatedAt',
]);
const TICKET_NUMBER_FIELDS = new Set(['priority', 'number']);

function applySystemFieldConditions(
  query: Record<string, any>,
  conditions: TSystemFieldCondition[],
): Record<string, any> {
  for (const condition of conditions) {
    const { key, operator, value } = condition || {};

    if (!key || !operator) {
      continue;
    }

    if (key === 'tagIds') {
      if (operator === 'eq' || operator === 'contains') {
        query.tagIds = { $in: [value] };
      } else if (operator === 'ne' || operator === 'doesNotContain') {
        query.tagIds = { $nin: [value] };
      } else if (operator === 'isSet') {
        query.tagIds = { $exists: true, $ne: [] };
      } else if (operator === 'isNotSet') {
        query.$or = [
          ...(query.$or || []),
          { tagIds: { $exists: false } },
          { tagIds: { $size: 0 } },
        ];
      }
      continue;
    }

    if (TICKET_NUMBER_FIELDS.has(key) || TICKET_DATE_FIELDS.has(key)) {
      const castValue = TICKET_DATE_FIELDS.has(key)
        ? new Date(value as string)
        : Number(value);

      switch (operator) {
        case 'eq':
          query[key] = castValue;
          break;
        case 'ne':
          query[key] = { $ne: castValue };
          break;
        case 'gt':
          query[key] = { ...query[key], $gt: castValue };
          break;
        case 'gte':
          query[key] = { ...query[key], $gte: castValue };
          break;
        case 'lt':
          query[key] = { ...query[key], $lt: castValue };
          break;
        case 'lte':
          query[key] = { ...query[key], $lte: castValue };
          break;
        case 'isSet':
          query[key] = { $exists: true, $ne: null };
          break;
        case 'isNotSet':
          query.$or = [
            ...(query.$or || []),
            { [key]: { $exists: false } },
            { [key]: null },
          ];
          break;
      }
      continue;
    }

    switch (operator) {
      case 'contains':
        query[key] = { $regex: String(value ?? ''), $options: 'i' };
        break;
      case 'doesNotContain':
        query[key] = { $not: { $regex: String(value ?? ''), $options: 'i' } };
        break;
      case 'eq':
        query[key] = value;
        break;
      case 'ne':
        query[key] = { $ne: value };
        break;
      case 'isSet':
        query[key] = { $exists: true, $ne: null };
        break;
      case 'isNotSet':
        query.$or = [
          ...(query.$or || []),
          { [key]: { $exists: false } },
          { [key]: null },
        ];
        break;
    }
  }

  return query;
}

export async function getTicketExportData(
  data: GetExportData,
  { subdomain, models }: IImportExportContext<IModels>,
): Promise<Record<string, any>[]> {
  const { cursor, limit, filters, ids, selectedFields } = data;

  if (!models) {
    throw new Error('Models not available in context');
  }

  let query: any = {};

  if (filters && Object.keys(filters).length > 0) {
    if (filters.name) {
      query.name = { $regex: filters.name, $options: 'i' };
    }
    if (filters.assigneeId) {
      query.assigneeId = filters.assigneeId;
    }
    if (filters.priority) {
      query.priority = Number(filters.priority);
    }
    if (filters.state) {
      query.state = filters.state;
    }
    if (filters.statusId) {
      query.statusId = filters.statusId;
    }
    if (filters.pipelineId) {
      query.pipelineId = filters.pipelineId;
    }
    if (Array.isArray(filters.systemFieldConditions)) {
      query = applySystemFieldConditions(
        query,
        filters.systemFieldConditions as TSystemFieldCondition[],
      );
    }
  }

  const { query: exportQuery, isIdsMode } = buildExportCursorQuery({
    baseQuery: query,
    cursor,
    ids,
    limit,
  });

  if (isIdsMode && exportQuery._id?.$in?.length === 0) {
    return [];
  }

  const tickets = await models.Ticket.find(exportQuery)
    .sort({ _id: 1 })
    .limit(limit)
    .lean();

  const allAssigneeIds = new Set<string>();
  const allPipelineIds = new Set<string>();
  const allTagIds = new Set<string>();
  const allStatusIds = new Set<string>();
  const allChannelIds = new Set<string>();
  const allCompanyIds = new Set<string>();
  const allCustomerIds = new Set<string>();

  for (const t of tickets) {
    if (t.assigneeId) allAssigneeIds.add(t.assigneeId);
    if (t.pipelineId) allPipelineIds.add(t.pipelineId);
    (t.tagIds || []).forEach((id: string) => allTagIds.add(id));
    if (t.statusId) allStatusIds.add(t.statusId);
    if (t.channelId) allChannelIds.add(t.channelId);
    (t.companyIds || []).forEach((id: string) => allCompanyIds.add(id));
    (t.customerFieldData?.customerIds || []).forEach((id: string) =>
      allCustomerIds.add(id),
    );
  }

  const [members, pipelines, tags, statuses, channels, companies, customers] =
    await Promise.all([
      allAssigneeIds.size
        ? sendTRPCMessage({
            subdomain,
            pluginName: 'core',
            method: 'query',
            module: 'users',
            action: 'find',
            input: { query: { _id: { $in: Array.from(allAssigneeIds) } } },
          })
        : [],
      allPipelineIds.size
        ? models.Pipeline.find({ _id: { $in: Array.from(allPipelineIds) } })
            .select('_id name')
            .lean()
        : [],
      allTagIds.size
        ? sendTRPCMessage({
            subdomain,
            pluginName: 'core',
            method: 'query',
            module: 'tags',
            action: 'find',
            input: { query: { _id: { $in: Array.from(allTagIds) } } },
          })
        : [],
      allStatusIds.size
        ? models.Status.find({ _id: { $in: Array.from(allStatusIds) } })
            .select('_id name')
            .lean()
        : [],
      allChannelIds.size
        ? models.Channels.find({ _id: { $in: Array.from(allChannelIds) } })
            .select('_id name')
            .lean()
        : [],
      allCompanyIds.size
        ? sendTRPCMessage({
            subdomain,
            pluginName: 'core',
            method: 'query',
            module: 'companies',
            action: 'find',
            input: { query: { _id: { $in: Array.from(allCompanyIds) } } },
          })
        : [],
      allCustomerIds.size
        ? sendTRPCMessage({
            subdomain,
            pluginName: 'core',
            method: 'query',
            module: 'customers',
            action: 'find',
            input: { query: { _id: { $in: Array.from(allCustomerIds) } } },
          })
        : [],
    ]);

  const allBranchIds = new Set<string>();
  const allDepartmentIds = new Set<string>();
  for (const m of members as any[]) {
    (m.branchIds || []).forEach((id: string) => allBranchIds.add(id));
    (m.departmentIds || []).forEach((id: string) => allDepartmentIds.add(id));
  }

  const [branches, departments] = await Promise.all([
    allBranchIds.size
      ? sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'query',
          module: 'branches',
          action: 'find',
          input: { query: { _id: { $in: Array.from(allBranchIds) } } },
        })
      : [],
    allDepartmentIds.size
      ? sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'query',
          module: 'departments',
          action: 'find',
          input: { query: { _id: { $in: Array.from(allDepartmentIds) } } },
        })
      : [],
  ]);

  const branchTitleMap = new Map<string, string>();
  for (const b of branches as any[]) {
    branchTitleMap.set(String(b._id), b.title || '');
  }

  const departmentTitleMap = new Map<string, string>();
  for (const d of departments as any[]) {
    departmentTitleMap.set(String(d._id), d.title || '');
  }

  const joinNames = (ids: string[] | undefined, map: Map<string, string>) =>
    (ids || [])
      .map((id) => map.get(String(id)) || '')
      .filter(Boolean)
      .join('; ');

  const assigneeMap = new Map<string, string>();
  const assigneeBranchMap = new Map<string, string>();
  const assigneeDepartmentMap = new Map<string, string>();
  for (const m of members as any[]) {
    const name =
      m.details?.fullName ||
      `${m.details?.firstName || ''} ${m.details?.lastName || ''}`.trim() ||
      m.email ||
      '';
    assigneeMap.set(String(m._id), name);
    assigneeBranchMap.set(
      String(m._id),
      joinNames(m.branchIds, branchTitleMap),
    );
    assigneeDepartmentMap.set(
      String(m._id),
      joinNames(m.departmentIds, departmentTitleMap),
    );
  }

  const pipelineMap = new Map<string, string>();
  for (const p of pipelines as any[]) {
    pipelineMap.set(String(p._id), p.name || '');
  }

  const tagMap = new Map<string, string>();
  for (const t of tags as any[]) {
    tagMap.set(String(t._id), t.name || '');
  }

  const statusMap = new Map<string, string>();
  for (const s of statuses as any[]) {
    statusMap.set(String(s._id), s.name || '');
  }

  const channelMap = new Map<string, string>();
  for (const c of channels as any[]) {
    channelMap.set(String(c._id), c.name || '');
  }

  const companyMap = new Map<string, string>();
  for (const c of companies as any[]) {
    companyMap.set(String(c._id), c.primaryName || '');
  }

  const customerMap = new Map<string, string>();
  for (const c of customers as any[]) {
    const name =
      `${c.firstName || ''} ${c.lastName || ''}`.trim() ||
      c.primaryEmail ||
      c.primaryPhone ||
      '';
    customerMap.set(String(c._id), name);
  }

  return tickets.map((t) =>
    buildTicketExportRow(t as any, selectedFields, {
      assigneeMap,
      pipelineMap,
      tagMap,
      statusMap,
      channelMap,
      companyMap,
      customerMap,
      assigneeBranchMap,
      assigneeDepartmentMap,
    }),
  );
}
