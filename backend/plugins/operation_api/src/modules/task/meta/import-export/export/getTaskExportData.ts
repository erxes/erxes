import {
  GetExportData,
  IImportExportContext,
  buildExportCursorQuery,
  normalizeExportLimit,
} from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { buildTaskExportRow } from './buildTaskExportRow';
import { escapeRegExp } from 'erxes-api-shared/utils';
import { STATUS_TYPES } from '@/status/constants/types';
import { ITaskDocument, ITaskFilter, CycleFilterType } from '../../../@types/task';
import mongoose, { FilterQuery } from 'mongoose';
import { IUserDocument } from 'erxes-api-shared/core-types';

/** Applies a date-based filter to a Mongoose query field. Supports 'no-date', 'in-past', and ISO date string values. */
const handleDateFilter = (
  filterQuery: FilterQuery<ITaskDocument>,
  fieldName: string,
  value: string | Date,
) => {
  if (value === 'no-date') {
    filterQuery[fieldName] = { $exists: false };
    return;
  }

  if (value === 'in-past') {
    filterQuery[fieldName] = { $lt: new Date() };
    return;
  }

  const stringValue = value instanceof Date ? value.toISOString() : value;

  filterQuery[fieldName] = { $lte: new Date(stringValue) };
};

/** Resolves the cycleId filter condition from a cycle filter type and team ID. Returns null to signal early empty result. */
async function applyCycleFilter(
  models: IModels,
  query: FilterQuery<ITaskDocument>,
  cycleFilter: CycleFilterType,
  teamId: string,
): Promise<boolean> {
  const now = new Date();

  switch (cycleFilter) {
    case 'noCycle':
      query.cycleId = null;
      return true;

    case 'anyPastCycle': {
      const pastCycles = await models.Cycle.find({
        teamId,
        endDate: { $lt: now },
      }).distinct('_id');
      if (pastCycles.length === 0) return false;
      query.cycleId = { $in: pastCycles } as FilterQuery<ITaskDocument>['cycleId'];
      return true;
    }

    case 'previousCycle': {
      const previousCycle = await models.Cycle.findOne({
        teamId,
        endDate: { $lt: now },
      }).sort({ endDate: -1 });
      if (!previousCycle) return false;
      query.cycleId = previousCycle._id;
      return true;
    }

    case 'currentCycle': {
      const currentCycle = await models.Cycle.findOne({
        teamId,
        startDate: { $lte: now },
        endDate: { $gte: now },
      });
      if (!currentCycle) return false;
      query.cycleId = currentCycle._id;
      return true;
    }

    case 'upcomingCycle': {
      const upcomingCycle = await models.Cycle.findOne({
        teamId,
        startDate: { $gt: now },
      }).sort({ startDate: 1 });
      if (!upcomingCycle) return false;
      query.cycleId = upcomingCycle._id;
      return true;
    }

    case 'anyFutureCycle': {
      const futureCycles = await models.Cycle.find({
        teamId,
        startDate: { $gt: now },
      }).distinct('_id');
      if (futureCycles.length === 0) return false;
      query.cycleId = { $in: futureCycles } as FilterQuery<ITaskDocument>['cycleId'];
      return true;
    }

    default:
      return true;
  }
}

/** Resolves matching project IDs from project-level filters (status, priority, lead, milestone name). Returns null to signal empty result. */
async function applyProjectFilter(
  models: IModels,
  query: FilterQuery<ITaskDocument>,
  filter: {
    projectStatus?: number;
    projectPriority?: number;
    projectLeadId?: string;
    projectMilestoneName?: string;
  },
): Promise<boolean> {
  let projectIds: string[] = [];

  if (filter.projectMilestoneName) {
    const matchingMilestones = await models.Milestone.find({
      name: { $regex: filter.projectMilestoneName, $options: 'i' },
    }).distinct('projectId');

    if (matchingMilestones.length === 0) return false;
    projectIds = matchingMilestones;
  }

  if (filter.projectStatus || filter.projectPriority || filter.projectLeadId) {
    const projectFilter: FilterQuery<{ _id: string; status?: number; priority?: number; leadId?: string }> = {};

    if (filter.projectStatus) projectFilter.status = filter.projectStatus;
    if (filter.projectPriority) projectFilter.priority = filter.projectPriority;
    if (filter.projectLeadId) projectFilter.leadId = filter.projectLeadId;
    if (projectIds.length > 0) projectFilter._id = { $in: projectIds };

    const matchingProjects = await models.Project.find(projectFilter).distinct('_id');
    if (matchingProjects.length === 0) return false;
    projectIds = matchingProjects;
  }

  if (projectIds.length > 0) {
    if (query.projectId) {
      if (!projectIds.includes(query.projectId as string)) return false;
    } else {
      query.projectId = { $in: projectIds } as FilterQuery<ITaskDocument>['projectId'];
    }
  }

  return true;
}

/** Builds the base Mongoose query from all export filter parameters. */
async function buildTaskQuery(
  models: IModels,
  filter: ReturnType<typeof Object.assign> & GetExportData & {
    search?: string;
    projectId?: string;
    cycleId?: string;
    milestone?: string;
    status?: string;
    assigneeId?: string;
    priority?: string;
    teamId?: string;
    startDate?: string;
    endDate?: string;
  } & ITaskFilter,
): Promise<FilterQuery<ITaskDocument> | null> {
  const query: FilterQuery<ITaskDocument> = {};

  if (filter.name) {
    query.name = { $regex: escapeRegExp(filter.name), $options: 'i' };
  } else if (filter.search?.trim()) {
    const sv = escapeRegExp(filter.search.trim());
    const re = new RegExp(sv, 'i');
    query.$or = [{ name: re }, { description: re }];
  }

  if (filter.status) query.status = filter.status;
  if (filter.statusType) query.statusType = filter.statusType;

  if (filter.priority !== undefined && filter.priority !== '') {
    query.priority = Number(filter.priority);
  }

  if (filter.startDate) handleDateFilter(query, 'startDate', filter.startDate);

  if (filter.targetDate) {
    handleDateFilter(query, 'targetDate', filter.targetDate);
  } else if (filter.endDate) {
    handleDateFilter(query, 'targetDate', filter.endDate);
  }

  if (filter.createdDate) handleDateFilter(query, 'createdAt', filter.createdDate);
  if (filter.updatedDate) handleDateFilter(query, 'updatedAt', filter.updatedDate);

  if (filter.completedDate) {
    query.statusType = STATUS_TYPES.COMPLETED;
    handleDateFilter(query, 'statusChangedDate', filter.completedDate);
  }

  if (filter.teamId) query.teamId = filter.teamId;
  if (filter.createdBy) query.createdBy = filter.createdBy;

  if (filter.assigneeId) {
    if (filter.assigneeId === 'no-assignee') {
      query.assigneeId = { $exists: false } as FilterQuery<ITaskDocument>['assigneeId'];
    } else {
      query.assigneeId = filter.assigneeId;
    }
  }

  if (filter.cycleId) {
    query.cycleId = filter.cycleId;
  } else if (filter.cycleFilter && filter.teamId) {
    const ok = await applyCycleFilter(models, query, filter.cycleFilter, filter.teamId);
    if (!ok) return null;
  }

  if (filter.projectId) {
    if (filter.projectId === 'no-project') {
      query.projectId = { $exists: false } as FilterQuery<ITaskDocument>['projectId'];
    } else {
      query.projectId = filter.projectId;
    }
  }

  if (
    filter.projectStatus ||
    filter.projectPriority ||
    filter.projectLeadId ||
    filter.projectMilestoneName
  ) {
    const ok = await applyProjectFilter(models, query, filter);
    if (!ok) return null;
  }

  if (filter.milestoneId) {
    query.milestoneId = filter.milestoneId;
  } else if (filter.milestone) {
    query.milestoneId = filter.milestone;
  }

  if (filter.estimatePoint) query.estimatePoint = filter.estimatePoint;

  if (filter.tagIds && filter.tagIds.length > 0) {
    query.tagIds = { $in: filter.tagIds } as FilterQuery<ITaskDocument>['tagIds'];
  }

  if (filter.labelIds && filter.labelIds.length > 0) {
    query.labelIds = { $in: filter.labelIds } as FilterQuery<ITaskDocument>['labelIds'];
  }

  if (filter.teamId && filter.projectId && filter.projectId !== 'no-project') {
    delete query.teamId;
  }

  if (filter.userId && !filter.teamId && !filter.assigneeId && !filter.projectId) {
    query.assigneeId = filter.userId;
  }

  return query;
}

/** Fetches and formats task export data with resolved display names for all related entities. */
export async function getTaskExportData(
  data: GetExportData & {
    search?: string;
    projectId?: string;
    cycleId?: string;
    milestone?: string;
    status?: string;
    assigneeId?: string;
    priority?: string;
    teamId?: string;
    startDate?: string;
    endDate?: string;
    filters?: ITaskFilter;
  },
  { subdomain, models }: IImportExportContext<IModels>,
): Promise<Record<string, unknown>[]> {
  const { cursor, limit, ids, selectedFields, filters } = data;
  const effectiveLimit = normalizeExportLimit(limit, 100);

  if (!models) {
    throw new Error('Models not available in context');
  }

  const { Task, Team, Status, Project, Milestone, Cycle } = models;

  const filter = { ...data, ...(filters || {}) };

  const query = await buildTaskQuery(models, filter);
  if (query === null) return [];

  const { query: exportQuery, isIdsMode } = buildExportCursorQuery({
    baseQuery: query as Record<string, unknown>,
    cursor,
    ids,
    limit: effectiveLimit,
  });

  if (isIdsMode && (exportQuery._id as { $in?: unknown[] })?.$in?.length === 0) {
    return [];
  }

  const tasks = await Task.find(exportQuery)
    .sort({ _id: 1 })
    .limit(effectiveLimit)
    .lean();

  const statusIds = new Set<string>();
  const teamIds = new Set<string>();
  const projectIds = new Set<string>();
  const milestoneIds = new Set<string>();
  const cycleIds = new Set<string>();
  const assigneeIds = new Set<string>();
  const creatorIds = new Set<string>();
  const tagIds = new Set<string>();
  const labelIds = new Set<string>();

  for (const t of tasks) {
    if (t.status) statusIds.add(String(t.status));
    if (t.teamId) teamIds.add(String(t.teamId));
    if (t.projectId) projectIds.add(String(t.projectId));
    if (t.milestoneId) milestoneIds.add(String(t.milestoneId));
    if (t.cycleId) cycleIds.add(String(t.cycleId));
    if (t.assigneeId) assigneeIds.add(String(t.assigneeId));
    if (t.createdBy) creatorIds.add(String(t.createdBy));
    if (t.tagIds) t.tagIds.forEach((id) => tagIds.add(String(id)));
    if (t.labelIds) t.labelIds.forEach((id) => labelIds.add(String(id)));
  }

  const [statuses, teams, projects, milestones, cycles, users, creators, tags, labels] = await Promise.all([
    statusIds.size ? Status.find({ _id: { $in: Array.from(statusIds) } }).select('_id name').lean() : [],
    teamIds.size ? Team.find({ _id: { $in: Array.from(teamIds) } }).select('_id name').lean() : [],
    projectIds.size ? Project.find({ _id: { $in: Array.from(projectIds) } }).select('_id name').lean() : [],
    milestoneIds.size ? Milestone.find({ _id: { $in: Array.from(milestoneIds) } }).select('_id name').lean() : [],
    cycleIds.size ? Cycle.find({ _id: { $in: Array.from(cycleIds) } }).select('_id name').lean() : [],

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
    creatorIds.size
      ? sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'query',
          module: 'users',
          action: 'find',
          input: { query: { _id: { $in: Array.from(creatorIds) } } },
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
    labelIds.size
      ? sendTRPCMessage({
          subdomain,
          pluginName: 'sales',
          method: 'query',
          module: 'pipelineLabel',
          action: 'find',
          input: { _id: { $in: Array.from(labelIds) } },
        })
      : [],
  ]);

  type NamedDoc = { _id: string | mongoose.Types.ObjectId; name?: string };

  const statusMap = new Map<string, string>();
  (statuses as NamedDoc[] || []).forEach((s) => statusMap.set(String(s._id), s.name || ''));

  const teamMap = new Map<string, string>();
  (teams as NamedDoc[] || []).forEach((t) => teamMap.set(String(t._id), t.name || ''));

  const projectMap = new Map<string, string>();
  (projects as NamedDoc[] || []).forEach((p) => projectMap.set(String(p._id), p.name || ''));

  const milestoneMap = new Map<string, string>();
  (milestones as NamedDoc[] || []).forEach((m) => milestoneMap.set(String(m._id), m.name || ''));

  const cycleMap = new Map<string, string>();
  (cycles as NamedDoc[] || []).forEach((c) => cycleMap.set(String(c._id), c.name || ''));

  const resolveUserName = (u: IUserDocument) =>
    u.details?.fullName ||
    `${u.details?.firstName || ''} ${u.details?.lastName || ''}`.trim() ||
    u.username ||
    u.email ||
    '';

  const assigneeMap = new Map<string, string>();
  (users as IUserDocument[] || []).forEach((u) => assigneeMap.set(String(u._id), resolveUserName(u)));

  const creatorMap = new Map<string, string>();
  (creators as IUserDocument[] || []).forEach((c) => creatorMap.set(String(c._id), resolveUserName(c)));

  const tagMap = new Map<string, string>();
  (tags as NamedDoc[] || []).forEach((t) => tagMap.set(String(t._id), t.name || ''));

  const labelMap = new Map<string, string>();
  (labels as NamedDoc[] || []).forEach((l) => labelMap.set(String(l._id), l.name || ''));

  return tasks.map((t) =>
    buildTaskExportRow(t as ITaskDocument & { number?: number }, selectedFields, {
      statusMap,
      projectMap,
      cycleMap,
      milestoneMap,
      assigneeMap,
      creatorMap,
      teamMap,
      tagMap,
      labelMap,
    }),
  );
}