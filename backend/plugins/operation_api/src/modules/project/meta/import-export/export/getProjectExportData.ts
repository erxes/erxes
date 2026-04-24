import {
  GetExportData,
  IImportExportContext,
  buildExportCursorQuery,
} from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { buildProjectExportRow } from './buildProjectExportRow';

const MAX_NAME_FILTER_LENGTH = 200;

const escapeRegex = (s: string): string =>
  s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function getProjectExportData(
  data: GetExportData,
  { subdomain, models }: IImportExportContext<IModels>,
): Promise<Record<string, any>[]> {
  const { cursor, filters, ids, selectedFields } = data;
  const limit = data.limit ?? 100;

  if (!models) {
    throw new Error('Models not available in context');
  }

  const query: any = {};

  if (filters && Object.keys(filters).length > 0) {
    const f = filters as Record<string, any>;

    if (f.name) {
      const raw = String(f.name).slice(0, MAX_NAME_FILTER_LENGTH);
      query.name = { $regex: escapeRegex(raw), $options: 'i' };
    }
    if (f.leadId) query.leadId = f.leadId;
    if (f.teamId) query.teamIds = { $in: [f.teamId] };
    if (f.memberId) query.memberIds = { $in: [f.memberId] };
    if (f.priority !== undefined && f.priority !== '') {
      const num = Number(f.priority);
      if (!isNaN(num)) query.priority = num;
    }
    if (f.status !== undefined && f.status !== '') {
      const num = Number(f.status);
      if (!isNaN(num)) query.status = num;
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

  const projects = await models.Project.find(exportQuery)
    .sort({ _id: 1 })
    .limit(limit)
    .lean();

  const teamIds = new Set<string>();
  const userIds = new Set<string>();
  const tagIds = new Set<string>();

  for (const p of projects as any[]) {
    (p.teamIds || []).forEach((id: string) => teamIds.add(String(id)));
    (p.memberIds || []).forEach((id: string) => userIds.add(String(id)));
    if (p.leadId) userIds.add(String(p.leadId));
    (p.tagIds || []).forEach((id: string) => tagIds.add(String(id)));
  }

  const teams = teamIds.size
    ? await models.Team.find({ _id: { $in: Array.from(teamIds) } })
        .select('_id name')
        .lean()
    : [];

  const [usersResult, tagsResult] = await Promise.allSettled([
    userIds.size
      ? sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'query',
          module: 'users',
          action: 'find',
          input: { query: { _id: { $in: Array.from(userIds) } } },
        })
      : [],
    tagIds.size
      ? sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'query',
          module: 'tags',
          action: 'find',
          input: { query: { _id: { $in: Array.from(tagIds) } } },
        })
      : [],
  ]);

  const users = usersResult.status === 'fulfilled' ? usersResult.value : [];
  const tags = tagsResult.status === 'fulfilled' ? tagsResult.value : [];

  const teamMap = new Map<string, string>();
  for (const t of teams as any[]) teamMap.set(String(t._id), t.name || '');

  const userMap = new Map<string, string>();
  for (const u of users as any[]) {
    const name =
      u.details?.fullName ||
      `${u.details?.firstName || ''} ${u.details?.lastName || ''}`.trim() ||
      u.email ||
      '';
    userMap.set(String(u._id), name);
  }

  const tagMap = new Map<string, string>();
  for (const t of tags as any[]) tagMap.set(String(t._id), t.name || '');

  return projects.map((p: any) =>
    buildProjectExportRow(p, selectedFields, {
      teamMap,
      memberMap: userMap,
      leadMap: userMap,
      tagMap,
    }),
  );
}
