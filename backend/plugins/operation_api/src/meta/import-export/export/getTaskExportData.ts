import {
  GetExportData,
  IImportExportContext,
  buildExportCursorQuery,
} from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { buildTaskExportRow } from './buildTaskExportRow';
import { stringifyId, buildIdNameMap, buildUserMap, safeString } from '../utils';

/**
 * Parses date ranges for date query filters.
 *
 * @param range The raw date range object.
 * @returns A MongoDB-compatible date range query object, or undefined.
 */
function buildDateRange(range: unknown): Record<string, Date> | undefined {
  if (!range || typeof range !== 'object') return undefined;
  const rangeObj = range as Record<string, unknown>;
  const result: Record<string, Date> = {};
  if (rangeObj.from) {
    const parsedDate = new Date(safeString(rangeObj.from));
    if (!Number.isNaN(parsedDate.getTime())) result.$gte = parsedDate;
  }
  if (rangeObj.to) {
    const parsedDate = new Date(safeString(rangeObj.to));
    if (!Number.isNaN(parsedDate.getTime())) result.$lte = parsedDate;
  }
  return Object.keys(result).length ? result : undefined;
}

/**
 * Adds date range query filters to the query object based on the filters.
 *
 * @param query The destination query object.
 * @param filters The active filters containing date parameters.
 */
function addDateRangeFilters(query: Record<string, unknown>, filters: Record<string, unknown>): void {
  const startRange = buildDateRange(filters.startDate);
  if (startRange) {
    query.startDate = startRange;
  }

  const targetRange = buildDateRange(filters.targetDate);
  if (targetRange) {
    query.targetDate = targetRange;
  }

  const createdRange = buildDateRange(filters.createdDate);
  if (createdRange) {
    query.createdAt = createdRange;
  }

  const updatedRange = buildDateRange(filters.updatedDate);
  if (updatedRange) {
    query.updatedAt = updatedRange;
  }
}

/**
 * Builds the task query object based on active filters.
 *
 * @param filters Optional active filters parameters.
 * @returns The MongoDB query object.
 */
function buildTaskQuery(filters?: Record<string, unknown>): Record<string, unknown> {
  const query: Record<string, unknown> = {};
  if (!filters || Object.keys(filters).length === 0) {
    return query;
  }
  if (filters.name) {
    query.name = { $regex: filters.name, $options: 'i' };
  }

  const directFields = [
    'assigneeId',
    'teamId',
    'status',
    'projectId',
    'cycleId',
    'milestoneId',
    'createdBy',
  ];
  for (const field of directFields) {
    if (filters[field]) {
      query[field] = filters[field];
    }
  }

  if (filters.priority != null) {
    query.priority = Number(filters.priority);
  }
  if (filters.statusType != null) {
    query.statusType = Number(filters.statusType);
  }
  if (Array.isArray(filters.tagIds) && filters.tagIds.length) {
    query.tagIds = { $in: filters.tagIds };
  }

  addDateRangeFilters(query, filters);

  return query;
}

interface ITaskFields {
  allTeamIds: Set<string>;
  allAssigneeIds: Set<string>;
  allStatusIds: Set<string>;
  allProjectIds: Set<string>;
  allCycleIds: Set<string>;
  allMilestoneIds: Set<string>;
  allTagIds: Set<string>;
}

interface ITaskToExtract {
  teamId?: unknown;
  assigneeId?: unknown;
  createdBy?: unknown;
  status?: unknown;
  projectId?: unknown;
  cycleId?: unknown;
  milestoneId?: unknown;
  tagIds?: unknown[];
}

/**
 * Safely converts an identifier to string and adds it to the target Set if defined.
 *
 * @param set The destination set to store the stringified ID.
 * @param id The optional raw identifier to stringify and add.
 */
function addIdToSet(set: Set<string>, id?: unknown): void {
  if (id) {
    set.add(stringifyId(id));
  }
}

/**
 * Extracts and maps various entity IDs from a single task document to the shared lookup fields sets.
 *
 * @param task The task object containing entity references.
 * @param fields The sets collector where extracted IDs are registered.
 */
function processSingleTask(task: ITaskToExtract, fields: ITaskFields): void {
  addIdToSet(fields.allTeamIds, task.teamId);
  addIdToSet(fields.allAssigneeIds, task.assigneeId);
  addIdToSet(fields.allAssigneeIds, task.createdBy);
  addIdToSet(fields.allStatusIds, task.status);
  addIdToSet(fields.allProjectIds, task.projectId);
  addIdToSet(fields.allCycleIds, task.cycleId);
  addIdToSet(fields.allMilestoneIds, task.milestoneId);

  if (Array.isArray(task.tagIds)) {
    for (const tagId of task.tagIds) {
      addIdToSet(fields.allTagIds, tagId);
    }
  }
}

/**
 * Extracts unique team, assignee, status, project, cycle, milestone, and tag IDs from tasks.
 *
 * @param tasks The array of raw task objects.
 * @returns An object containing sets of unique IDs for each entity type.
 */
function extractTaskIds(tasks: Array<Record<string, unknown>>) {
  const fields: ITaskFields = {
    allTeamIds: new Set<string>(),
    allAssigneeIds: new Set<string>(),
    allStatusIds: new Set<string>(),
    allProjectIds: new Set<string>(),
    allCycleIds: new Set<string>(),
    allMilestoneIds: new Set<string>(),
    allTagIds: new Set<string>(),
  };

  for (const t of tasks) {
    const task = t as ITaskToExtract;
    processSingleTask(task, fields);
  }

  return fields;
}

/**
 * Retrieves and formats tasks for export.
 *
 * @param data Parameters specifying limits, cursor position, selected fields, and filters.
 * @param context The import/export handler context containing models and subdomain.
 * @returns A promise resolving to an array of formatted task records.
 */
export async function getTaskExportData(
  data: GetExportData,
  { subdomain, models }: IImportExportContext<IModels>,
): Promise<Record<string, string>[]> {
  const { cursor, limit, filters, ids, selectedFields } = data;

  if (!models) {
    throw new Error('Models not available in context');
  }

  const query = buildTaskQuery(filters);

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

  if (!tasks.length) return [];

  const {
    allTeamIds,
    allAssigneeIds,
    allStatusIds,
    allProjectIds,
    allCycleIds,
    allMilestoneIds,
    allTagIds,
  } = extractTaskIds(tasks);

  const [teams, members, statuses, projects, cycles, milestones, tags] =
    await Promise.all([
      allTeamIds.size
        ? models.Team.find({ _id: { $in: Array.from(allTeamIds) } })
            .select('_id name')
            .lean()
        : [],
      allAssigneeIds.size
        ? sendTRPCMessage({
            subdomain,
            pluginName: 'core',
            method: 'query',
            module: 'users',
            action: 'find',
            input: { query: { _id: { $in: Array.from(allAssigneeIds) } } },
            defaultValue: [],
          })
        : [],
      allStatusIds.size
        ? models.Status.find({ _id: { $in: Array.from(allStatusIds) } })
            .select('_id name')
            .lean()
        : [],
      allProjectIds.size
        ? models.Project.find({ _id: { $in: Array.from(allProjectIds) } })
            .select('_id name')
            .lean()
        : [],
      allCycleIds.size
        ? models.Cycle.find({ _id: { $in: Array.from(allCycleIds) } })
            .select('_id name')
            .lean()
        : [],
      allMilestoneIds.size
        ? models.Milestone.find({ _id: { $in: Array.from(allMilestoneIds) } })
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
            defaultValue: [],
          })
        : [],
    ]);

  const teamMap = buildIdNameMap(teams);
  const assigneeMap = buildUserMap(members);
  const statusMap = buildIdNameMap(statuses);
  const projectMap = buildIdNameMap(projects);
  const cycleMap = buildIdNameMap(cycles);
  const milestoneMap = buildIdNameMap(milestones);
  const tagMap = buildIdNameMap(tags);

  return tasks.map((t) =>
    buildTaskExportRow(t, selectedFields, {
      teamMap,
      assigneeMap,
      statusMap,
      projectMap,
      cycleMap,
      milestoneMap,
      tagMap,
    }),
  );
}
