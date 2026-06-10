import {
  GetExportData,
  IImportExportContext,
  buildExportCursorQuery,
  normalizeExportLimit,
} from 'erxes-api-shared/core-modules';
import { sendTRPCMessage, escapeRegExp } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { buildProjectExportRow } from './buildProjectExportRow';
import { STATUS_TYPES } from '@/status/constants/types';
import { IProjectDocument, IProjectFilter } from '../../../@types/project';
import { FilterQuery } from 'mongoose';
import { IUserDocument } from 'erxes-api-shared/core-types';

/** Applies a date-based filter to a Mongoose query field. Supports 'no-date', 'in-past', and ISO date string values. */
const handleDateFilter = (
  filterQuery: FilterQuery<IProjectDocument>,
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

/** Applies basic text, status, priority, and date range filters to a project query. */
function applyBasicProjectFilters(
  query: FilterQuery<IProjectDocument>,
  andFilters: FilterQuery<IProjectDocument>[],
  filter: {
    _ids?: string[];
    name?: string;
    search?: string;
    status?: number;
    priority?: number;
    startDate?: string | Date;
    targetDate?: string | Date;
  },
): void {
  if (filter._ids?.length) {
    query._id = { $in: filter._ids };
  }

  if (filter.name) {
    query.name = { $regex: escapeRegExp(filter.name), $options: 'i' };
  } else if (filter.search?.trim()) {
    const sv = escapeRegExp(filter.search.trim());
    const re = new RegExp(sv, 'i');
    andFilters.push({ $or: [{ name: re }, { description: re }] });
  }

  if (filter.status) {
    query.status = filter.status;
  }

  if (filter.priority) {
    query.priority = filter.priority;
  }

  if (filter.startDate) {
    handleDateFilter(query, 'startDate', filter.startDate);
  }

  if (filter.targetDate) {
    handleDateFilter(query, 'targetDate', filter.targetDate);
  }
}

/** Applies lead, members, and tags inclusion filters to a project query. */
function applyProjectMemberFilters(
  query: FilterQuery<IProjectDocument>,
  andFilters: FilterQuery<IProjectDocument>[],
  filter: {
    leadId?: string;
    memberId?: string;
    memberIds?: string[];
    tagIds?: string[];
  },
): void {
  if (filter.leadId) {
    query.leadId = filter.leadId;
  }

  if (filter.memberIds?.length) {
    query.memberIds = { $in: filter.memberIds };
  }

  if (filter.memberId) {
    andFilters.push({
      $or: [
        { memberIds: { $in: [filter.memberId] } },
        { leadId: filter.memberId },
      ],
    });
  }

  if (filter.tagIds?.length) {
    query.tagIds = { $in: filter.tagIds };
  }
}

/** Applies team relationship and member user ID filters to a project query. */
async function applyProjectTeamFilters(
  query: FilterQuery<IProjectDocument>,
  andFilters: FilterQuery<IProjectDocument>[],
  filter: {
    userId?: string;
    memberId?: string;
    teamIds?: string[];
  },
  models: IModels,
): Promise<void> {
  const { TeamMember } = models;
  if (filter.teamIds?.length) {
    query.teamIds = { $in: filter.teamIds };
  }

  const hasNoTeamIds = !filter.teamIds || filter.teamIds.length <= 0;
  const shouldApplyUserFilter = (hasNoTeamIds && filter.userId) || (!filter.teamIds && !filter.memberId && filter.userId);

  if (shouldApplyUserFilter && filter.userId) {
    const teamIds = await TeamMember.find({
      memberId: filter.userId,
    }).distinct('teamId');

    if (filter.userId) {
      andFilters.push({
        $or: [
          { teamIds: { $in: teamIds } },
          { leadId: filter.userId },
          { memberIds: filter.userId },
        ],
      });
    } else {
      query.teamIds = { $in: teamIds };
    }
  }
}

/** Applies active state and task scope filters to a project query. */
async function applyProjectActiveFilters(
  query: FilterQuery<IProjectDocument>,
  andFilters: FilterQuery<IProjectDocument>[],
  filter: {
    active?: boolean;
    taskId?: string;
  },
  models: IModels,
): Promise<void> {
  if (filter.active) {
    const statusFilter = {
      $nin: [STATUS_TYPES.CANCELLED, STATUS_TYPES.COMPLETED],
    };

    if (filter.taskId) {
      const task = await models.Task.findOne({
        _id: filter.taskId,
      });

      if (task?.projectId) {
        andFilters.push({
          $or: [{ status: statusFilter }, { _id: task.projectId }],
        });
      } else {
        query.status = statusFilter;
      }
    } else {
      query.status = statusFilter;
    }
  }
}

/** Builds the base Mongoose query filter from the project export parameters. */
async function buildProjectQuery(
  models: IModels,
  filter: GetExportData & {
    search?: string;
    active?: boolean;
    taskId?: string;
    userId?: string;
    memberId?: string;
    memberIds?: string[];
    leadId?: string;
    startDate?: string | Date;
    targetDate?: string | Date;
    priority?: number;
    status?: number;
    name?: string;
    _ids?: string[];
    tagIds?: string[];
    teamIds?: string[];
  },
): Promise<FilterQuery<IProjectDocument>> {
  const query: FilterQuery<IProjectDocument> = {};
  const andFilters: FilterQuery<IProjectDocument>[] = [];

  applyBasicProjectFilters(query, andFilters, filter);
  applyProjectMemberFilters(query, andFilters, filter);
  await applyProjectTeamFilters(query, andFilters, filter, models);
  await applyProjectActiveFilters(query, andFilters, filter, models);

  if (andFilters.length > 0) {
    query.$and = andFilters;
  }

  return query;
}

/** Collects all related entity IDs referenced by the given project documents. */
function collectProjectEntityIds(projects: IProjectDocument[]): {
  teamIds: Set<string>;
  userIds: Set<string>;
  tagIds: Set<string>;
} {
  const teamIds = new Set<string>();
  const userIds = new Set<string>();
  const tagIds = new Set<string>();

  for (const p of projects) {
    if (p.teamIds) {
      p.teamIds.forEach(id => teamIds.add(String(id)));
    }
    if (p.tagIds) {
      p.tagIds.forEach(id => tagIds.add(String(id)));
    }
    if (p.leadId) {
      userIds.add(String(p.leadId));
    }
    if (p.memberIds) {
      p.memberIds.forEach(id => userIds.add(String(id)));
    }
    if (p.createdBy) {
      userIds.add(String(p.createdBy));
    }
  }

  return { teamIds, userIds, tagIds };
}

/** Fetches all related entities for a project list and returns lookup maps. */
async function resolveProjectEntityMaps(
  subdomain: string,
  models: IModels,
  ids: { teamIds: Set<string>; userIds: Set<string>; tagIds: Set<string> },
): Promise<{
  teamMap: Map<string, string>;
  userMap: Map<string, string>;
  tagMap: Map<string, string>;
}> {
  const { Team } = models;

  const [teams, users, tags] = await Promise.all([
    ids.teamIds.size ? Team.find({ _id: { $in: Array.from(ids.teamIds) } }).select('_id name').lean() : [],
    ids.userIds.size
      ? sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'query',
          module: 'users',
          action: 'find',
          input: { query: { _id: { $in: Array.from(ids.userIds) } } },
        })
      : [],
    ids.tagIds.size
      ? sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'query',
          module: 'tags',
          action: 'find',
          input: { query: { _id: { $in: Array.from(ids.tagIds) } } },
        })
      : [],
  ]);

  const teamMap = new Map<string, string>();
  (teams || []).forEach((t: { _id: unknown; name?: string }) => teamMap.set(String(t._id), t.name || ''));

  const userMap = new Map<string, string>();
  (users || []).forEach((u: IUserDocument) => {
    const name = u.details?.fullName || `${u.details?.firstName || ''} ${u.details?.lastName || ''}`.trim() || u.username || u.email || '';
    userMap.set(String(u._id), name);
  });

  const tagMap = new Map<string, string>();
  (tags || []).forEach((t: { _id: unknown; name?: string }) => tagMap.set(String(t._id), t.name || ''));

  return { teamMap, userMap, tagMap };
}

/** Fetches and formats project export rows with resolved display names for all related entities. */
export async function getProjectExportData(
  data: GetExportData & {
    search?: string;
    filters?: IProjectFilter;
  },
  { subdomain, models }: IImportExportContext<IModels>,
): Promise<Record<string, string>[]> {
  const { cursor, limit, ids, selectedFields, filters } = data;
  const effectiveLimit = normalizeExportLimit(limit, 100);

  if (!models) {
    throw new Error('Models not available in context');
  }

  const { Project } = models;

  const filter = { ...data, ...(filters || {}) };

  const query = await buildProjectQuery(models, filter);

  const { query: exportQuery, isIdsMode } = buildExportCursorQuery({
    baseQuery: query as Record<string, unknown>,
    cursor,
    ids,
    limit: effectiveLimit,
  });

  if (isIdsMode && (exportQuery._id as { $in?: unknown[] })?.$in?.length === 0) {
    return [];
  }

  const projects = await Project.find(exportQuery)
    .sort({ _id: 1 })
    .limit(effectiveLimit)
    .lean();

  const entityIds = collectProjectEntityIds(projects as IProjectDocument[]);
  const { teamMap, userMap, tagMap } = await resolveProjectEntityMaps(subdomain, models, entityIds);

  const statusMap = new Map<string, string>([
    [String(STATUS_TYPES.BACKLOG), 'Backlog'],
    [String(STATUS_TYPES.UNSTARTED), 'Todo'],
    [String(STATUS_TYPES.STARTED), 'In progress'],
    [String(STATUS_TYPES.COMPLETED), 'Done'],
    [String(STATUS_TYPES.CANCELLED), 'Cancelled'],
    [String(STATUS_TYPES.TRIAGE), 'Triage'],
  ]);

  return (projects as IProjectDocument[]).map((p) =>
    buildProjectExportRow(p, selectedFields, {
      statusMap,
      teamMap,
      leadMap: userMap,
      membersMap: userMap,
      creatorMap: userMap,
      tagMap,
    }),
  );
}
