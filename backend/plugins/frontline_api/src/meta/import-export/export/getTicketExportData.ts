import {
  GetExportData,
  IImportExportContext,
  buildExportCursorQuery,
} from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { buildTicketExportRow } from './buildTicketExportRow';

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

  for (const t of tickets) {
    if (t.assigneeId) allAssigneeIds.add(t.assigneeId);
    if (t.pipelineId) allPipelineIds.add(t.pipelineId);
    (t.tagIds || []).forEach((id: string) => allTagIds.add(id));
  }

  const [members, pipelines, tags] = await Promise.all([
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
  ]);

  const assigneeMap = new Map<string, string>();
  for (const m of members as any[]) {
    const name =
      m.details?.fullName ||
      `${m.details?.firstName || ''} ${m.details?.lastName || ''}`.trim() ||
      m.email ||
      '';
    assigneeMap.set(String(m._id), name);
  }

  const pipelineMap = new Map<string, string>();
  for (const p of pipelines as any[]) {
    pipelineMap.set(String(p._id), p.name || '');
  }

  const tagMap = new Map<string, string>();
  for (const t of tags as any[]) {
    tagMap.set(String(t._id), t.name || '');
  }

  return tickets.map((t) =>
    buildTicketExportRow(t as any, selectedFields, {
      assigneeMap,
      pipelineMap,
      tagMap,
    }),
  );
}
