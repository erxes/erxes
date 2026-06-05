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
import { ITaskDocument, ITaskFilter } from '../../../@types/task';
import mongoose, { FilterQuery } from 'mongoose';

interface IUser {
  _id: string;
  username?: string;
  email?: string;
  details?: {
    fullName?: string;
    firstName?: string;
    lastName?: string;
  };
}

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
): Promise<Record<string, any>[]> {
  const { cursor, limit, ids, selectedFields, filters } = data;
  const effectiveLimit = normalizeExportLimit(limit, 100);

  if (!models) {
    throw new Error('Models not available in context');
  }

  const { Task, Team, Status, Project, Milestone, Cycle } = models;

  // Merge direct query parameters and nested filters
  const filter = { ...data, ...(filters || {}) };

  const query: FilterQuery<ITaskDocument> = {};

  if (filter.name) {
    query.name = { $regex: escapeRegExp(filter.name), $options: 'i' };
  } else if (filter.search?.trim()) {
    const sv = escapeRegExp(filter.search.trim());
    const re = new RegExp(sv, 'i');
    query.$or = [{ name: re }, { description: re }];
  }

  if (filter.status) {
    query.status = filter.status;
  }
  if (filter.statusType) {
    query.statusType = filter.statusType;
  }

  if (filter.priority !== undefined && filter.priority !== '') {
    query.priority = Number(filter.priority);
  }

  if (filter.startDate) {
    handleDateFilter(query, 'startDate', filter.startDate);
  }

  if (filter.targetDate) {
    handleDateFilter(query, 'targetDate', filter.targetDate);
  }

  if (filter.createdDate) {
    handleDateFilter(query, 'createdAt', filter.createdDate);
  }

  if (filter.updatedDate) {
    handleDateFilter(query, 'updatedAt', filter.updatedDate);
  }

  if (filter.completedDate) {
    query.statusType = STATUS_TYPES.COMPLETED;
    handleDateFilter(query, 'statusChangedDate', filter.completedDate);
  }

  if (filter.teamId) {
    query.teamId = filter.teamId;
  }

  if (filter.createdBy) {
    query.createdBy = filter.createdBy;
  }

  if (filter.assigneeId) {
    if (filter.assigneeId === 'no-assignee') {
      query.assigneeId = { $exists: false } as any;
    } else {
      query.assigneeId = filter.assigneeId;
    }
  }

  if (filter.cycleId) {
    query.cycleId = filter.cycleId;
  }

  if (filter.cycleFilter && filter.teamId) {
    const now = new Date();

    switch (filter.cycleFilter) {
      case 'noCycle':
        query.cycleId = null;
        break;

      case 'anyPastCycle': {
        const pastCycles = await models.Cycle.find({
          teamId: filter.teamId,
          endDate: { $lt: now },
        }).distinct('_id');
        if (pastCycles.length === 0) {
          return [];
        }
        query.cycleId = { $in: pastCycles } as any;
        break;
      }

      case 'previousCycle': {
        const previousCycle = await models.Cycle.findOne({
          teamId: filter.teamId,
          endDate: { $lt: now },
        }).sort({ endDate: -1 });
        if (previousCycle) {
          query.cycleId = previousCycle._id;
        } else {
          return [];
        }
        break;
      }

      case 'currentCycle': {
        const currentCycle = await models.Cycle.findOne({
          teamId: filter.teamId,
          startDate: { $lte: now },
          endDate: { $gte: now },
        });
        if (currentCycle) {
          query.cycleId = currentCycle._id;
        } else {
          return [];
        }
        break;
      }

      case 'upcomingCycle': {
        const upcomingCycle = await models.Cycle.findOne({
          teamId: filter.teamId,
          startDate: { $gt: now },
        }).sort({ startDate: 1 });
        if (upcomingCycle) {
          query.cycleId = upcomingCycle._id;
        } else {
          return [];
        }
        break;
      }

      case 'anyFutureCycle': {
        const futureCycles = await models.Cycle.find({
          teamId: filter.teamId,
          startDate: { $gt: now },
        }).distinct('_id');
        if (futureCycles.length === 0) {
          return [];
        }
        query.cycleId = { $in: futureCycles } as any;
        break;
      }
    }
  }

  if (filter.projectId) {
    if (filter.projectId === 'no-project') {
      query.projectId = { $exists: false } as any;
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
    let projectIds: string[] = [];

    if (filter.projectMilestoneName) {
      const matchingMilestones = await models.Milestone.find({
        name: { $regex: filter.projectMilestoneName, $options: 'i' },
      }).distinct('projectId');

      if (matchingMilestones.length === 0) {
        return [];
      }

      projectIds = matchingMilestones;
    }

    if (
      filter.projectStatus ||
      filter.projectPriority ||
      filter.projectLeadId
    ) {
      const projectFilter: FilterQuery<any> = {};

      if (filter.projectStatus) {
        projectFilter.status = filter.projectStatus;
      }

      if (filter.projectPriority) {
        projectFilter.priority = filter.projectPriority;
      }

      if (filter.projectLeadId) {
        projectFilter.leadId = filter.projectLeadId;
      }

      if (projectIds.length > 0) {
        projectFilter._id = { $in: projectIds };
      }

      const matchingProjects =
        await models.Project.find(projectFilter).distinct('_id');

      if (matchingProjects.length === 0) {
        return [];
      }

      projectIds = matchingProjects;
    }

    if (projectIds.length > 0) {
      if (query.projectId) {
        if (!projectIds.includes(query.projectId as string)) {
          return [];
        }
      } else {
        query.projectId = { $in: projectIds } as any;
      }
    }
  }

  if (filter.milestoneId) {
    query.milestoneId = filter.milestoneId;
  } else if (filter.milestone) {
    query.milestoneId = filter.milestone;
  }

  if (filter.estimatePoint) {
    query.estimatePoint = filter.estimatePoint;
  }

  if (filter.tagIds && filter.tagIds.length > 0) {
    query.tagIds = { $in: filter.tagIds } as any;
  }

  if (filter.labelIds && filter.labelIds.length > 0) {
    query.labelIds = { $in: filter.labelIds } as any;
  }

  if (
    filter.teamId &&
    filter.projectId &&
    filter.projectId !== 'no-project'
  ) {
    delete query.teamId;
  }

  if (
    filter.userId &&
    !filter.teamId &&
    !filter.assigneeId &&
    !filter.projectId
  ) {
    query.assigneeId = filter.userId;
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
    if (t.tagIds) {
      t.tagIds.forEach((id) => tagIds.add(String(id)));
    }
    if (t.labelIds) {
      t.labelIds.forEach((id) => labelIds.add(String(id)));
    }
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

  const statusMap = new Map<string, string>();
  (statuses || []).forEach((s: { _id: string | mongoose.Types.ObjectId; name?: string }) => statusMap.set(String(s._id), s.name || ''));

  const teamMap = new Map<string, string>();
  (teams || []).forEach((t: { _id: string | mongoose.Types.ObjectId; name?: string }) => teamMap.set(String(t._id), t.name || ''));

  const projectMap = new Map<string, string>();
  (projects || []).forEach((p: { _id: string | mongoose.Types.ObjectId; name?: string }) => projectMap.set(String(p._id), p.name || ''));

  const milestoneMap = new Map<string, string>();
  (milestones || []).forEach((m: { _id: string | mongoose.Types.ObjectId; name?: string }) => milestoneMap.set(String(m._id), m.name || ''));

  const cycleMap = new Map<string, string>();
  (cycles || []).forEach((c: { _id: string | mongoose.Types.ObjectId; name?: string }) => cycleMap.set(String(c._id), c.name || ''));

  const assigneeMap = new Map<string, string>();
  (users || []).forEach((u: IUser) => {
    const name = u.details?.fullName || `${u.details?.firstName || ''} ${u.details?.lastName || ''}`.trim() || u.username || u.email || '';
    assigneeMap.set(String(u._id), name);
  });

  const creatorMap = new Map<string, string>();
  (creators || []).forEach((c: IUser) => {
    const name = c.details?.fullName || `${c.details?.firstName || ''} ${c.details?.lastName || ''}`.trim() || c.username || c.email || '';
    creatorMap.set(String(c._id), name);
  });

  const tagMap = new Map<string, string>();
  (tags || []).forEach((t: { _id: string; name?: string }) => tagMap.set(String(t._id), t.name || ''));

  const labelMap = new Map<string, string>();
  (labels || []).forEach((l: { _id: string; name?: string }) => labelMap.set(String(l._id), l.name || ''));

  return tasks.map((t: any) =>
    buildTaskExportRow(t, selectedFields, {
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