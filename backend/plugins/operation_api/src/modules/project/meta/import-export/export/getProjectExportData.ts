import {
  GetExportData,
  IImportExportContext,
  buildExportCursorQuery,
  normalizeExportLimit,
} from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { buildProjectExportRow } from './buildProjectExportRow';
import { escapeRegExp } from 'erxes-api-shared/utils';
import { STATUS_TYPES } from '@/status/constants/types';
import { IProjectDocument, IProjectFilter } from '../../../@types/project';
import mongoose, { FilterQuery } from 'mongoose';
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

export async function getProjectExportData(
  data: GetExportData & {
    search?: string;
    filters?: IProjectFilter;
  },
  { subdomain, models }: IImportExportContext<IModels>,
): Promise<Record<string, any>[]> {
  const { cursor, limit, ids, selectedFields, filters } = data;
  const effectiveLimit = normalizeExportLimit(limit, 100);

  if (!models) {
    throw new Error('Models not available in context');
  }

  const { Project, Team, TeamMember } = models;

  const filter = { ...data, ...(filters || {}) };

  const query: FilterQuery<IProjectDocument> = {};
  const andFilters: any[] = [];

  if (filter._ids && filter._ids.length) {
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

  if (filter.leadId) {
    query.leadId = filter.leadId;
  }

  if (filter.memberIds && filter.memberIds.length > 0) {
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

  if (filter.tagIds && filter.tagIds.length > 0) {
    query.tagIds = { $in: filter.tagIds };
  }

  if (filter.teamIds && filter.teamIds.length > 0) {
    query.teamIds = { $in: filter.teamIds };
  }

  if (
    (filter.teamIds && filter.teamIds.length <= 0 && filter.userId) ||
    (!filter.teamIds && !filter.memberId && filter.userId)
  ) {
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

  if (andFilters.length > 0) {
    query.$and = andFilters;
  }

  const { query: exportQuery, isIdsMode } = buildExportCursorQuery({
    baseQuery: query as Record<string, any>,
    cursor,
    ids,
    limit: effectiveLimit,
  });

  if (isIdsMode && (exportQuery._id as any)?.$in?.length === 0) {
    return [];
  }

  const projects = await Project.find(exportQuery)
    .sort({ _id: 1 })
    .limit(effectiveLimit)
    .lean();

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
    if (p.leadId) userIds.add(String(p.leadId));
    if (p.memberIds) {
      p.memberIds.forEach(id => userIds.add(String(id)));
    }
    if (p.createdBy) userIds.add(String(p.createdBy));
  }

  const [teams, users, tags] = await Promise.all([
    teamIds.size ? Team.find({ _id: { $in: Array.from(teamIds) } }).select('_id name').lean() : [],
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

  const statusMap = new Map<string, string>([
    [String(STATUS_TYPES.BACKLOG), 'Backlog'],
    [String(STATUS_TYPES.UNSTARTED), 'Todo'],
    [String(STATUS_TYPES.STARTED), 'In progress'],
    [String(STATUS_TYPES.COMPLETED), 'Done'],
    [String(STATUS_TYPES.CANCELLED), 'Cancelled'],
    [String(STATUS_TYPES.TRIAGE), 'Triage'],
  ]);

  const teamMap = new Map<string, string>();
  (teams || []).forEach((t: { _id: string | mongoose.Types.ObjectId; name?: string }) => teamMap.set(String(t._id), t.name || ''));

  const userMap = new Map<string, string>();
  (users || []).forEach((u: IUserDocument) => {
    const name = u.details?.fullName || `${u.details?.firstName || ''} ${u.details?.lastName || ''}`.trim() || u.username || u.email || '';
    userMap.set(String(u._id), name);
  });

  const tagMap = new Map<string, string>();
  (tags || []).forEach((t: { _id: string; name?: string }) => tagMap.set(String(t._id), t.name || ''));

  return projects.map((p: any) =>
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
