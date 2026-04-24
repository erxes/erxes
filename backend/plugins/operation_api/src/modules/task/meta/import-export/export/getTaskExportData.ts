import {
  GetExportData,
  IImportExportContext,
  buildExportCursorQuery,
} from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { buildTaskExportRow } from './buildTaskExportRow';

const MAX_NAME_FILTER_LENGTH = 200;

const escapeRegex = (s: string): string =>
  s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function getTaskExportData(
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
    if (f.teamId) query.teamId = f.teamId;
    if (f.status) query.status = f.status;
    if (f.statusType !== undefined && f.statusType !== '') {
      const num = Number(f.statusType);
      if (!isNaN(num)) query.statusType = num;
    }
    if (f.priority !== undefined && f.priority !== '') {
      const num = Number(f.priority);
      if (!isNaN(num)) query.priority = num;
    }
    if (f.projectId) query.projectId = f.projectId;
    if (f.cycleId) query.cycleId = f.cycleId;
    if (f.milestoneId) query.milestoneId = f.milestoneId;
    if (f.assigneeId) query.assigneeId = f.assigneeId;
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

  const tasks = await models.Task.find(exportQuery)
    .sort({ _id: 1 })
    .limit(limit)
    .lean();

  const teamIds = new Set<string>();
  const statusIds = new Set<string>();
  const projectIds = new Set<string>();
  const cycleIds = new Set<string>();
  const milestoneIds = new Set<string>();
  const assigneeIds = new Set<string>();
  const tagIds = new Set<string>();

  for (const t of tasks as any[]) {
    if (t.teamId) teamIds.add(String(t.teamId));
    if (t.status) statusIds.add(String(t.status));
    if (t.projectId) projectIds.add(String(t.projectId));
    if (t.cycleId) cycleIds.add(String(t.cycleId));
    if (t.milestoneId) milestoneIds.add(String(t.milestoneId));
    if (t.assigneeId) assigneeIds.add(String(t.assigneeId));
    (t.tagIds || []).forEach((id: string) => tagIds.add(id));
  }

  const [teams, statuses, projects, cycles, milestones] = await Promise.all([
    teamIds.size
      ? models.Team.find({ _id: { $in: Array.from(teamIds) } })
          .select('_id name')
          .lean()
      : [],
    statusIds.size
      ? models.Status.find({ _id: { $in: Array.from(statusIds) } })
          .select('_id name')
          .lean()
      : [],
    projectIds.size
      ? models.Project.find({ _id: { $in: Array.from(projectIds) } })
          .select('_id name')
          .lean()
      : [],
    cycleIds.size
      ? models.Cycle.find({ _id: { $in: Array.from(cycleIds) } })
          .select('_id name')
          .lean()
      : [],
    milestoneIds.size
      ? models.Milestone.find({ _id: { $in: Array.from(milestoneIds) } })
          .select('_id name')
          .lean()
      : [],
  ]);

  const [usersResult, tagsResult] = await Promise.allSettled([
    assigneeIds.size
      ? sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'query',
          module: 'users',
          action: 'find',
          input: { query: { _id: { $in: Array.from(assigneeIds) } } },
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

  const statusMap = new Map<string, string>();
  for (const s of statuses as any[]) statusMap.set(String(s._id), s.name || '');

  const projectMap = new Map<string, string>();
  for (const p of projects as any[]) projectMap.set(String(p._id), p.name || '');

  const cycleMap = new Map<string, string>();
  for (const c of cycles as any[]) cycleMap.set(String(c._id), c.name || '');

  const milestoneMap = new Map<string, string>();
  for (const m of milestones as any[])
    milestoneMap.set(String(m._id), m.name || '');

  const assigneeMap = new Map<string, string>();
  for (const u of users as any[]) {
    const name =
      u.details?.fullName ||
      `${u.details?.firstName || ''} ${u.details?.lastName || ''}`.trim() ||
      u.email ||
      '';
    assigneeMap.set(String(u._id), name);
  }

  const tagMap = new Map<string, string>();
  for (const t of tags as any[]) tagMap.set(String(t._id), t.name || '');

  return tasks.map((t: any) =>
    buildTaskExportRow(t, selectedFields, {
      teamMap,
      statusMap,
      projectMap,
      cycleMap,
      milestoneMap,
      assigneeMap,
      tagMap,
    }),
  );
}
