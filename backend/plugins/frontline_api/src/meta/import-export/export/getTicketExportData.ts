import {
  GetExportData,
  IImportExportContext,
  buildExportCursorQuery,
} from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { generateFilter } from '@/ticket/utils/generateFilter';
import { IModels } from '~/connectionResolvers';
import { buildTicketExportRow } from './buildTicketExportRow';

export async function getTicketExportData(
  data: GetExportData,
  { subdomain, models }: IImportExportContext<IModels>,
): Promise<Record<string, unknown>[]> {
  const { cursor, limit, filters, ids, selectedFields } = data;

  if (!models) {
    throw new Error('Models not available in context');
  }

  const query =
    ids?.length && !Object.keys(filters || {}).length
      ? {}
      : await generateFilter(
          {
            ...filters,
            searchValue: filters?.searchValue || filters?.name,
          },
          undefined,
          models,
          subdomain,
          true,
        );

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

  const [members, pipelines, tags]: [
    Pick<IUserDocument, '_id' | 'details' | 'email'>[],
    { _id: string; name?: string }[],
    { _id: string; name?: string }[],
  ] = await Promise.all([
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
  for (const m of members) {
    const name =
      m.details?.fullName ||
      `${m.details?.firstName || ''} ${m.details?.lastName || ''}`.trim() ||
      m.email ||
      '';
    assigneeMap.set(String(m._id), name);
  }

  const pipelineMap = new Map<string, string>();
  for (const p of pipelines) {
    pipelineMap.set(String(p._id), p.name || '');
  }

  const tagMap = new Map<string, string>();
  for (const t of tags) {
    tagMap.set(String(t._id), t.name || '');
  }

  return tickets.map((t) =>
    buildTicketExportRow(t, selectedFields, {
      assigneeMap,
      pipelineMap,
      tagMap,
    }),
  );
}
