import {
  GetExportData,
  IImportExportContext,
  buildExportCursorQuery,
  normalizeExportLimit,
} from 'erxes-api-shared/core-modules';
import { sendTRPCMessage, escapeRegExp } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { buildTaskExportRow } from './buildTaskExportRow';
import { STATUS_TYPES } from '@/status/constants/types';
import { ITaskDocument, ITaskFilter, CycleFilterType } from '../../../@types/task';
import mongoose, { FilterQuery } from 'mongoose';
import { IUserDocument } from 'erxes-api-shared/core-types';

type NamedDoc = { _id: string | mongoose.Types.ObjectId; name?: string };

/** Applies a date-based filter to a Mongoose query field. Supports 'no-date', 'in-past', and ISO date string values. */
const handleDateFilter = (
  filterQuery: FilterQuery<ITaskDocument>,
  fieldName: string,
  value: string | Date,
) => {
  if (value === 'no-date') { filterQuery[fieldName] = { $exists: false }; return; }
  if (value === 'in-past') { filterQuery[fieldName] = { $lt: new Date() }; return; }
  const stringValue = value instanceof Date ? value.toISOString() : value;
  filterQuery[fieldName] = { $lte: new Date(stringValue) };
};

/** Resolves a user document's display name from profile fields, username, or email. */
const resolveUserName = (u: IUserDocument): string =>
  u.details?.fullName ||
  `${u.details?.firstName || ''} ${u.details?.lastName || ''}`.trim() ||
  u.username ||
  u.email ||
  '';

/** Applies name exact match or full-text search regex to the query. */
function applyTextFilter(
  query: FilterQuery<ITaskDocument>,
  filter: { name?: string; search?: string },
): void {
  if (filter.name) {
    query.name = { $regex: escapeRegExp(filter.name), $options: 'i' };
  } else if (filter.search?.trim()) {
    const sv = escapeRegExp(filter.search.trim());
    query.$or = [{ name: new RegExp(sv, 'i') }, { description: new RegExp(sv, 'i') }];
  }
}

/** Applies status, statusType, and priority filters to the query. */
function applyStatusFilters(
  query: FilterQuery<ITaskDocument>,
  filter: { status?: string; statusType?: number; priority?: string | number },
): void {
  if (filter.status) query.status = filter.status;
  if (filter.statusType) query.statusType = filter.statusType;
  if (filter.priority !== undefined && filter.priority !== '') {
    query.priority = Number(filter.priority);
  }
}

/** Applies all date-range filters (startDate, targetDate, endDate, createdDate, updatedDate, completedDate) to the query. */
function applyDateFilters(
  query: FilterQuery<ITaskDocument>,
  filter: {
    startDate?: string | Date;
    targetDate?: string | Date;
    endDate?: string | Date;
    createdDate?: string;
    updatedDate?: string;
    completedDate?: string;
  },
): void {
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
}

/** Applies assigneeId (with no-assignee support), createdBy, and userId fallback to the query. */
function applyUserFilters(
  query: FilterQuery<ITaskDocument>,
  filter: { assigneeId?: string; createdBy?: string; teamId?: string; projectId?: string; userId?: string },
): void {
  if (filter.createdBy) query.createdBy = filter.createdBy;
  if (filter.assigneeId) {
    query.assigneeId = filter.assigneeId === 'no-assignee'
      ? { $exists: false } as FilterQuery<ITaskDocument>['assigneeId']
      : filter.assigneeId;
  } else if (filter.userId && !filter.teamId && !filter.projectId) {
    query.assigneeId = filter.userId;
  }
}

/** Applies tagIds and labelIds array inclusion filters to the query. */
function applyTagLabelFilters(
  query: FilterQuery<ITaskDocument>,
  filter: { tagIds?: string[]; labelIds?: string[] },
): void {
  if (filter.tagIds && filter.tagIds.length > 0) {
    query.tagIds = { $in: filter.tagIds } as FilterQuery<ITaskDocument>['tagIds'];
  }
  if (filter.labelIds && filter.labelIds.length > 0) {
    query.labelIds = { $in: filter.labelIds } as FilterQuery<ITaskDocument>['labelIds'];
  }
}

/** Resolves the cycleId constraint from a cycle filter type. Returns false to signal an empty result. */
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
      const ids = await models.Cycle.find({ teamId, endDate: { $lt: now } }).distinct('_id');
      if (!ids.length) return false;
      query.cycleId = { $in: ids } as FilterQuery<ITaskDocument>['cycleId'];
      return true;
    }
    case 'previousCycle': {
      const cycleDoc = await models.Cycle.findOne({ teamId, endDate: { $lt: now } }).sort({ endDate: -1 });
      if (!cycleDoc) return false;
      query.cycleId = cycleDoc._id;
      return true;
    }
    case 'currentCycle': {
      const cycleDoc = await models.Cycle.findOne({ teamId, startDate: { $lte: now }, endDate: { $gte: now } });
      if (!cycleDoc) return false;
      query.cycleId = cycleDoc._id;
      return true;
    }
    case 'upcomingCycle': {
      const cycleDoc = await models.Cycle.findOne({ teamId, startDate: { $gt: now } }).sort({ startDate: 1 });
      if (!cycleDoc) return false;
      query.cycleId = cycleDoc._id;
      return true;
    }
    case 'anyFutureCycle': {
      const ids = await models.Cycle.find({ teamId, startDate: { $gt: now } }).distinct('_id');
      if (!ids.length) return false;
      query.cycleId = { $in: ids } as FilterQuery<ITaskDocument>['cycleId'];
      return true;
    }
    default:
      return true;
  }
}

/** Resolves project IDs based on milestone name filter. Returns null if no match (to signal empty result). */
async function resolveProjectIdsByMilestone(
  models: IModels,
  milestoneName: string,
): Promise<string[] | null> {
  const projectIds = await models.Milestone.find({
    name: { $regex: milestoneName, $options: 'i' },
  }).distinct('projectId');
  return projectIds.length ? projectIds : null;
}

/** Resolves project IDs based on project-level properties (status, priority, lead). Returns null if no match. */
async function resolveProjectIdsByProps(
  models: IModels,
  filter: { projectStatus?: number; projectPriority?: number; projectLeadId?: string; },
  existingIds: string[],
): Promise<string[] | null> {
  const pf: FilterQuery<{ _id: string; status?: number; priority?: number; leadId?: string }> = {};
  if (filter.projectStatus) pf.status = filter.projectStatus;
  if (filter.projectPriority) pf.priority = filter.projectPriority;
  if (filter.projectLeadId) pf.leadId = filter.projectLeadId;
  if (existingIds.length) pf._id = { $in: existingIds };

  const projectIds = await models.Project.find(pf).distinct('_id');
  return projectIds.length ? projectIds : null;
}

/** Resolves matching project IDs from project-level sub-filters. Returns false to signal an empty result. */
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
    const ids = await resolveProjectIdsByMilestone(models, filter.projectMilestoneName);
    if (!ids) return false;
    projectIds = ids;
  }

  if (filter.projectStatus || filter.projectPriority || filter.projectLeadId) {
    const ids = await resolveProjectIdsByProps(models, filter, projectIds);
    if (!ids) return false;
    projectIds = ids;
  }

  if (projectIds.length) {
    if (query.projectId && !projectIds.includes(query.projectId as string)) return false;
    if (!query.projectId) query.projectId = { $in: projectIds } as FilterQuery<ITaskDocument>['projectId'];
  }
  return true;
}

/** Applies hierarchy-related filters (team, project, milestone, estimatePoint) to the query. */
function applyHierarchyFilters(
  query: FilterQuery<ITaskDocument>,
  filter: { teamId?: string; projectId?: string; milestoneId?: string | null; milestone?: string; estimatePoint?: number; }
): void {
  if (filter.teamId) query.teamId = filter.teamId;
  if (filter.estimatePoint) query.estimatePoint = filter.estimatePoint;

  if (filter.milestoneId) { query.milestoneId = filter.milestoneId; }
  else if (filter.milestone) { query.milestoneId = filter.milestone; }

  if (filter.projectId) {
    query.projectId = filter.projectId === 'no-project'
      ? { $exists: false } as FilterQuery<ITaskDocument>['projectId']
      : filter.projectId;
  }

  if (filter.teamId && filter.projectId && filter.projectId !== 'no-project') {
    delete query.teamId;
  }
}

/** Resolves and applies complex asynchronous filters (cycle, project properties). Returns false if empty result. */
async function applyAsyncFilters(
  models: IModels,
  query: FilterQuery<ITaskDocument>,
  filter: {
    cycleId?: string | null; cycleFilter?: CycleFilterType; teamId?: string;
    projectStatus?: number; projectPriority?: number; projectLeadId?: string; projectMilestoneName?: string;
  }
): Promise<boolean> {
  if (filter.cycleId) {
    query.cycleId = filter.cycleId;
  } else if (filter.cycleFilter && filter.teamId) {
    if (!await applyCycleFilter(models, query, filter.cycleFilter, filter.teamId)) return false;
  }

  if (filter.projectStatus || filter.projectPriority || filter.projectLeadId || filter.projectMilestoneName) {
    if (!await applyProjectFilter(models, query, filter)) return false;
  }

  return true;
}

/** Builds the base Mongoose filter query from all export filter parameters. */
async function buildTaskQuery(
  models: IModels,
  filter: GetExportData & {
    search?: string; projectId?: string; milestone?: string;
    status?: string; assigneeId?: string; priority?: string | number; teamId?: string;
    startDate?: string | Date; endDate?: string | Date;
  } & Omit<Partial<ITaskFilter>, 'priority'>,
): Promise<FilterQuery<ITaskDocument> | null> {
  const query: FilterQuery<ITaskDocument> = {};

  applyTextFilter(query, filter);
  applyStatusFilters(query, filter);
  applyDateFilters(query, filter);
  applyUserFilters(query, filter);
  applyTagLabelFilters(query, filter);
  applyHierarchyFilters(query, filter);

  if (!await applyAsyncFilters(models, query, filter)) return null;

  return query;
}

/** Collects all related entity IDs referenced by the given task documents into typed Sets. */
function collectTaskEntityIds(tasks: ITaskDocument[]): {
  statusIds: Set<string>; teamIds: Set<string>; projectIds: Set<string>;
  milestoneIds: Set<string>; cycleIds: Set<string>; assigneeIds: Set<string>;
  creatorIds: Set<string>; tagIds: Set<string>; labelIds: Set<string>;
} {
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
    t.tagIds?.forEach((id) => tagIds.add(String(id)));
    t.labelIds?.forEach((id) => labelIds.add(String(id)));
  }

  return { statusIds, teamIds, projectIds, milestoneIds, cycleIds, assigneeIds, creatorIds, tagIds, labelIds };
}

/** Fetches all related entities for a task list in parallel and returns named lookup Maps. */
async function resolveTaskEntityMaps(
  subdomain: string,
  models: IModels,
  ids: ReturnType<typeof collectTaskEntityIds>,
): Promise<{
  statusMap: Map<string, string>; teamMap: Map<string, string>; projectMap: Map<string, string>;
  milestoneMap: Map<string, string>; cycleMap: Map<string, string>; assigneeMap: Map<string, string>;
  creatorMap: Map<string, string>; tagMap: Map<string, string>; labelMap: Map<string, string>;
}> {
  const { Team, Status, Project, Milestone, Cycle } = models;

  /** Fetches users from the core plugin using the provided user IDs. */
  const fetchUsers = (userIds: Set<string>) =>
    userIds.size
      ? sendTRPCMessage({ subdomain, pluginName: 'core', method: 'query', module: 'users', action: 'find', input: { query: { _id: { $in: Array.from(userIds) } } } })
      : Promise.resolve([]);

  const [statuses, teams, projects, milestones, cycles, users, creators, tags, labels] = await Promise.all([
    ids.statusIds.size ? Status.find({ _id: { $in: Array.from(ids.statusIds) } }).select('_id name').lean() : [],
    ids.teamIds.size ? Team.find({ _id: { $in: Array.from(ids.teamIds) } }).select('_id name').lean() : [],
    ids.projectIds.size ? Project.find({ _id: { $in: Array.from(ids.projectIds) } }).select('_id name').lean() : [],
    ids.milestoneIds.size ? Milestone.find({ _id: { $in: Array.from(ids.milestoneIds) } }).select('_id name').lean() : [],
    ids.cycleIds.size ? Cycle.find({ _id: { $in: Array.from(ids.cycleIds) } }).select('_id name').lean() : [],
    fetchUsers(ids.assigneeIds),
    fetchUsers(ids.creatorIds),
    ids.tagIds.size
      ? sendTRPCMessage({ subdomain, pluginName: 'core', method: 'query', module: 'tags', action: 'find', input: { query: { _id: { $in: Array.from(ids.tagIds) } } } })
      : [],
    ids.labelIds.size
      ? sendTRPCMessage({ subdomain, pluginName: 'sales', method: 'query', module: 'pipelineLabel', action: 'find', input: { _id: { $in: Array.from(ids.labelIds) } } })
      : [],
  ]);

  /** Converts an array of named documents into a Map of ID strings to names. */
  const toMap = (docs: NamedDoc[]) => new Map((docs || []).map((d) => [String(d._id), d.name || '']));
  
  /** Converts an array of user documents into a Map of ID strings to resolved full names. */
  const toUserMap = (docs: IUserDocument[]) => new Map((docs || []).map((u) => [String(u._id), resolveUserName(u)]));

  return {
    statusMap: toMap(statuses as NamedDoc[]),
    teamMap: toMap(teams as NamedDoc[]),
    projectMap: toMap(projects as NamedDoc[]),
    milestoneMap: toMap(milestones as NamedDoc[]),
    cycleMap: toMap(cycles as NamedDoc[]),
    assigneeMap: toUserMap(users as IUserDocument[]),
    creatorMap: toUserMap(creators as IUserDocument[]),
    tagMap: toMap(tags as NamedDoc[]),
    labelMap: toMap(labels as NamedDoc[]),
  };
}

/** Fetches and formats task export rows with resolved display names for all related entities. */
export async function getTaskExportData(
  data: GetExportData & {
    search?: string; projectId?: string; cycleId?: string; milestone?: string;
    status?: string; assigneeId?: string; priority?: string | number; teamId?: string;
    startDate?: string; endDate?: string; filters?: Omit<Partial<ITaskFilter>, 'priority'>;
  },
  { subdomain, models }: IImportExportContext<IModels>,
): Promise<Record<string, unknown>[]> {
  const { cursor, limit, ids, selectedFields, filters } = data;
  const effectiveLimit = normalizeExportLimit(limit, 100);

  if (!models) throw new Error('Models not available in context');

  const filter = { ...data, ...(filters || {}) };
  const query = await buildTaskQuery(models, filter);
  if (query === null) return [];

  const { query: exportQuery, isIdsMode } = buildExportCursorQuery({
    baseQuery: query as Record<string, unknown>,
    cursor,
    ids,
    limit: effectiveLimit,
  });

  if (isIdsMode && (exportQuery._id as { $in?: unknown[] })?.$in?.length === 0) return [];

  const tasks = await models.Task.find(exportQuery).sort({ _id: 1 }).limit(effectiveLimit).lean();

  const entityIds = collectTaskEntityIds(tasks as ITaskDocument[]);
  const maps = await resolveTaskEntityMaps(subdomain, models, entityIds);

  return tasks.map((t) =>
    buildTaskExportRow(t as ITaskDocument & { number?: number }, selectedFields, maps),
  );
}