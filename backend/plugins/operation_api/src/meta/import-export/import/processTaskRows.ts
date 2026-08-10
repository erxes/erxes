import mongoose from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { STATUS_TYPES } from '@/status/constants/types';
import {
  ITask,
  ITaskDocument,
  ITaskUpdate,
} from '@/task/@types/task';
import { graphqlPubsub, sendTRPCMessage } from 'erxes-api-shared/utils';
import { safeString, stringifyId, TASK_CONTENT_TYPE } from '../utils';

const PRIORITY_BY_LABEL = new Map<string, number>([
  ['no priority', 0],
  ['minor', 1],
  ['medium', 2],
  ['high', 3],
  ['critical', 4],
]);

/**
 * Safely build a query filter that searches by name OR _id.
 * Only includes the _id condition when the value is a valid ObjectId
 * to prevent "Cast to ObjectId failed" errors on plain name strings.
 */
function nameOrIdFilter(val: string): Record<string, unknown> {
  if (mongoose.Types.ObjectId.isValid(val)) {
    return { $or: [{ name: val }, { _id: val }] };
  }
  return { name: val };
}

/**
 * Escapes regex metacharacters in a string.
 */
function escapeRegExp(val: string): string {
  return val.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
}

/**
 * Returns a readable error message from an unknown thrown value.
 */
function getErrorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

type TImportTaskDoc = Partial<ITask> & {
  propertiesData?: Record<string, unknown>;
};

type TPreparedTaskDoc = ITask & {
  name: string;
  teamId: string;
  status: string;
  propertiesData?: Record<string, unknown>;
};

type TExistingTask = {
  _id?: unknown;
  name?: unknown;
  teamId?: unknown;
};

type TPreparedRowDoc = {
  row: Record<string, unknown>;
  doc: TPreparedTaskDoc;
};

type TExistingTaskMaps = {
  byId: Map<string, TExistingTask>;
  byNameAndTeam: Map<string, TExistingTask>;
};

type TTaskSaveType = 'create' | 'update';

type TTaskSaveResult = {
  task: ITaskDocument;
  type: TTaskSaveType;
};

interface ITagLookup {
  _id?: unknown;
  name?: string;
}

const toOptionalId = (value: unknown): string | undefined => {
  const id = stringifyId(value);
  return id || undefined;
};

const idsEqual = (left: unknown, right: unknown): boolean =>
  stringifyId(left) === stringifyId(right);

const getTaskKey = (name: string, teamId: unknown): string =>
  `${name.toLowerCase()}_${stringifyId(teamId)}`;

const splitListValue = (value: unknown): string[] =>
  safeString(value)
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);

/**
 * Checks whether all required task fields were resolved.
 */
function isPreparedTaskDoc(doc: TImportTaskDoc): doc is TPreparedTaskDoc {
  return Boolean(doc.name && doc.teamId && doc.status);
}

/**
 * Resolves the team ID by checking the provided team name/ID value.
 *
 * @param models The database models.
 * @param teamVal The raw team identifier value.
 * @returns A promise resolving to the team ID.
 */
async function resolveTeam(models: IModels, teamVal?: unknown): Promise<string> {
  const val = safeString(teamVal).trim();
  if (!val) {
    throw new Error('Team is required');
  }
  const team = await models.Team.findOne(nameOrIdFilter(val)).lean();
  if (!team) {
    throw new Error(`Team not found: "${val}"`);
  }
  return stringifyId(team._id);
}

/**
 * Resolves the status ID and type, falling back to Backlog if not found.
 *
 * @param models The database models.
 * @param teamId The resolved team ID.
 * @param statusVal The raw status identifier value.
 * @returns A promise resolving to the status ID and status type.
 */
async function resolveStatus(
  models: IModels,
  teamId: unknown,
  statusVal?: unknown,
): Promise<{ status: string; statusType: number }> {
  const val = safeString(statusVal).trim();
  if (val) {
    const statusDoc = await models.Status.findOne({
      teamId,
      name: { $regex: `^${escapeRegExp(val)}$`, $options: 'i' },
    }).lean();

    if (statusDoc) {
      return { status: stringifyId(statusDoc._id), statusType: statusDoc.type };
    }

    throw new Error(`Status not found: "${val}"`);
  }

  // Fall back to Backlog when status is empty
  const backlog = await models.Status.findOne({
    teamId,
    type: STATUS_TYPES.BACKLOG,
  }).lean();
  if (backlog) {
    return { status: stringifyId(backlog._id), statusType: backlog.type };
  }

  throw new Error('Status not resolved and Backlog status not found');
}

/**
 * Resolves the priority number based on the priority value or label.
 *
 * @param priorityVal The raw priority identifier value.
 * @returns The resolved priority index, or undefined.
 */
function resolvePriority(priorityVal?: unknown): number | undefined {
  const val = safeString(priorityVal).trim();
  if (val === '') {
    return undefined;
  }
  const num = Number(val);
  if (!Number.isNaN(num) && num >= 0 && num <= 4) {
    return num;
  }

  const priority = PRIORITY_BY_LABEL.get(val.toLowerCase());
  if (priority === undefined) {
    throw new Error(`Priority not found: "${val}"`);
  }

  return priority;
}

/**
 * Resolves the project ID based on the project identifier value.
 *
 * @param models The database models.
 * @param projectVal The raw project identifier value.
 * @returns A promise resolving to the project ID.
 */
async function resolveProject(
  models: IModels,
  projectVal?: unknown,
  teamId?: unknown,
): Promise<string | undefined> {
  const val = safeString(projectVal).trim();
  if (!val) {
    return undefined;
  }
  const project = await models.Project.findOne(nameOrIdFilter(val)).lean();
  if (!project) {
    throw new Error(`Project not found: "${val}"`);
  }
  if (
    teamId &&
    Array.isArray(project.teamIds) &&
    !project.teamIds.some((projectTeamId) => idsEqual(projectTeamId, teamId))
  ) {
    throw new Error(`Project "${val}" is not in the selected team`);
  }

  return toOptionalId(project._id);
}

/**
 * Resolves the cycle ID based on the cycle identifier value within a team.
 *
 * @param models The database models.
 * @param teamId The team ID.
 * @param cycleVal The raw cycle identifier value.
 * @returns A promise resolving to the cycle ID.
 */
async function resolveCycle(
  models: IModels,
  teamId: unknown,
  cycleVal?: unknown,
): Promise<string | undefined> {
  const val = safeString(cycleVal).trim();
  if (!val) {
    return undefined;
  }
  const cycle = await models.Cycle.findOne({
    ...nameOrIdFilter(val),
    teamId,
  }).lean();

  if (!cycle) {
    throw new Error(`Cycle not found: "${val}"`);
  }

  if (cycle.isCompleted) {
    throw new Error(`Cannot add task to completed cycle: "${val}"`);
  }

  return toOptionalId(cycle._id);
}

/**
 * Resolves the milestone ID based on the milestone identifier value within a project.
 *
 * @param models The database models.
 * @param projectId The project ID.
 * @param milestoneVal The raw milestone identifier value.
 * @returns A promise resolving to the milestone ID.
 */
async function resolveMilestone(
  models: IModels,
  projectId: unknown,
  milestoneVal?: unknown,
): Promise<string | undefined> {
  const val = safeString(milestoneVal).trim();
  if (!val) {
    return undefined;
  }

  if (!projectId) {
    throw new Error('Milestone requires a Project to be specified');
  }

  const milestone = await models.Milestone.findOne({
    ...nameOrIdFilter(val),
    projectId,
  }).lean();

  if (!milestone) {
    throw new Error(`Milestone not found: "${val}"`);
  }

  return toOptionalId(milestone._id);
}

/**
 * Validates and resolves the estimate point value.
 *
 * @param estimateVal The raw estimate point value.
 * @returns The resolved numeric estimate point, or undefined.
 */
function resolveEstimate(estimateVal?: unknown): number | undefined {
  if (estimateVal === undefined || estimateVal === '') {
    return undefined;
  }
  const num = Number(estimateVal);
  if (Number.isNaN(num) || num < 0) {
    throw new TypeError(`Estimate Point must be a non-negative number, got: "${safeString(estimateVal)}"`);
  }
  return num;
}

/**
 * Safely parses and validates a raw date value.
 */
function parseDateValue(value: unknown, fieldName: string): Date | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  let date: Date;
  if (value instanceof Date) {
    date = value;
  } else if (typeof value === 'number') {
    date = new Date(value);
  } else {
    const str = safeString(value).trim();
    if (!str) {
      return undefined;
    }
    date = new Date(str);
  }

  if (Number.isNaN(date.getTime())) {
    throw new TypeError(`Invalid ${fieldName}: "${safeString(value)}"`);
  }
  return date;
}

/**
 * Validates and parses start/due dates.
 *
 * @param startDateVal The raw start date value.
 * @param targetDateVal The raw target/due date value.
 * @returns An object containing the parsed start and target dates.
 */
function resolveDates(startDateVal?: unknown, targetDateVal?: unknown): { startDate?: Date; targetDate?: Date } {
  const startDate = parseDateValue(startDateVal, 'Start Date');
  const targetDate = parseDateValue(targetDateVal, 'Due Date');

  if (startDate && targetDate && startDate > targetDate) {
    throw new TypeError('Start Date must not be after Due Date');
  }

  return { startDate, targetDate };
}

/**
 * Resolves basic task text fields from a raw import row.
 */
function resolveNameAndDescription(
  row: Record<string, unknown>,
  doc: TImportTaskDoc,
  errors: string[],
): void {
  const rawName = row.name ?? row.Name ?? '';
  const name = safeString(rawName).trim();
  if (!name) {
    errors.push('Name is required');
  } else {
    doc.name = name;
  }

  const rawDescription = row.description ?? row.Description ?? '';
  const description = safeString(rawDescription).trim();
  if (description) {
    doc.description = description;
  }
}

/**
 * Resolves the required team and status values for a task row.
 */
async function resolveTaskTeamAndStatus(
  models: IModels,
  row: Record<string, unknown>,
  doc: TImportTaskDoc,
  errors: string[],
): Promise<string | undefined> {
  let teamId: string | undefined;

  try {
    teamId = await resolveTeam(models, row.teamId ?? row.Team);
    doc.teamId = teamId;
  } catch (e) {
    errors.push(getErrorMessage(e));
  }

  if (!teamId) {
    return undefined;
  }

  try {
    const statusInfo = await resolveStatus(models, teamId, row.status ?? row.Status);
    doc.status = statusInfo.status;
    doc.statusType = statusInfo.statusType;
  } catch (e) {
    errors.push(getErrorMessage(e));
  }

  return teamId;
}

/**
 * Resolves the optional assignee value using the prepared user lookup map.
 */
function resolveTaskAssignee(
  row: Record<string, unknown>,
  userMap: Map<string, string>,
  doc: TImportTaskDoc,
  errors: string[],
): void {
  const rawAssigneeVal = row.assigneeId ?? row.Assignee ?? '';
  const assigneeVal = safeString(rawAssigneeVal).trim();
  if (!assigneeVal) {
    return;
  }

  const resolvedId = userMap.get(assigneeVal.toLowerCase());
  if (!resolvedId) {
    errors.push(`Assignee user not found: "${assigneeVal}"`);
    return;
  }

  if (resolvedId === 'AMBIGUOUS') {
    errors.push(
      `Assignee identifier "${assigneeVal}" is ambiguous. Please use a more specific identifier like email or User ID.`,
    );
    return;
  }

  doc.assigneeId = resolvedId;
}

/**
 * Resolves optional project and milestone references for a task row.
 */
async function resolveTaskProjectAndMilestone(
  models: IModels,
  row: Record<string, unknown>,
  teamId: string | undefined,
  doc: TImportTaskDoc,
  errors: string[],
): Promise<void> {
  let projectId: string | undefined;

  try {
    projectId = await resolveProject(models, row.projectId ?? row.Project, teamId);
    doc.projectId = projectId;
  } catch (e) {
    errors.push(getErrorMessage(e));
  }

  try {
    doc.milestoneId = await resolveMilestone(
      models,
      projectId,
      row.milestoneId ?? row.Milestone,
    );
  } catch (e) {
    errors.push(getErrorMessage(e));
  }
}

/**
 * Resolves the optional cycle reference for a task row.
 */
async function resolveTaskCycle(
  models: IModels,
  row: Record<string, unknown>,
  teamId: string | undefined,
  doc: TImportTaskDoc,
  errors: string[],
): Promise<void> {
  if (!teamId) {
    return;
  }

  try {
    doc.cycleId = await resolveCycle(models, teamId, row.cycleId ?? row.Cycle);
  } catch (e) {
    errors.push(getErrorMessage(e));
  }
}

/**
 * Resolves priority, estimate, and date values for a task row.
 */
function resolveTaskPriorityEstimateAndDates(
  row: Record<string, unknown>,
  doc: TImportTaskDoc,
  errors: string[],
): void {
  try {
    doc.priority = resolvePriority(row.priority ?? row.Priority);
  } catch (e) {
    errors.push(getErrorMessage(e));
  }

  try {
    doc.estimatePoint = resolveEstimate(row.estimatePoint ?? row['Estimate Point']);
  } catch (e) {
    errors.push(getErrorMessage(e));
  }

  try {
    const dates = resolveDates(
      row.startDate ?? row['Start Date'],
      row.targetDate ?? row['Due Date'],
    );
    doc.startDate = dates.startDate;
    doc.targetDate = dates.targetDate;
  } catch (e) {
    errors.push(getErrorMessage(e));
  }
}

const buildTagMap = (tags: ITagLookup[]): Map<string, string> => {
  const tagMap = new Map<string, string>();

  for (const tag of tags) {
    const id = toOptionalId(tag._id);
    if (!id) {
      continue;
    }

    tagMap.set(id.toLowerCase(), id);
    if (tag.name) {
      tagMap.set(tag.name.toLowerCase(), id);
    }
  }

  return tagMap;
};

/**
 * Resolves task tag names or IDs from a comma/semicolon-separated import value.
 */
async function resolveTaskTags(
  subdomain: string,
  row: Record<string, unknown>,
  doc: TImportTaskDoc,
  errors: string[],
): Promise<void> {
  const tagValues = splitListValue(row.tagIds ?? row.Tags);
  if (!tagValues.length) {
    return;
  }

  const tags: ITagLookup[] = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'tags',
    action: 'find',
    input: {
      query: {
        type: { $in: [null, '', TASK_CONTENT_TYPE] },
        $or: [
          { _id: { $in: tagValues } },
          ...tagValues.map((val) => ({
            name: { $regex: `^${escapeRegExp(val)}$`, $options: 'i' },
          })),
        ],
      },
    },
    defaultValue: [],
  });

  const tagMap = buildTagMap(tags);
  const tagIds: string[] = [];

  for (const tagValue of tagValues) {
    const tagId = tagMap.get(tagValue.toLowerCase());
    if (!tagId) {
      errors.push(`Tag not found: "${tagValue}"`);
    } else {
      tagIds.push(tagId);
    }
  }

  if (tagIds.length) {
    doc.tagIds = Array.from(new Set(tagIds));
  }
}

/**
 * Extracts and validates custom field values from propertiesData-prefixed columns.
 */
async function resolveTaskCustomProperties(
  subdomain: string,
  row: Record<string, unknown>,
  doc: TImportTaskDoc,
  errors: string[],
): Promise<void> {
  const propertiesData: Record<string, unknown> = {};
  for (const key of Object.keys(row)) {
    if (key.startsWith('propertiesData.')) {
      const fieldId = key.slice('propertiesData.'.length);
      const val = row[key];
      if (val !== undefined && val !== null && val !== '') {
        propertiesData[fieldId] = val;
      }
    }
  }

  if (Object.keys(propertiesData).length === 0) {
    return;
  }

  try {
    doc.propertiesData = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'mutation',
      module: 'fields',
      action: 'validateFieldValues',
      input: { data: propertiesData },
      defaultValue: propertiesData,
    });
  } catch (e) {
    errors.push(getErrorMessage(e));
  }
}

/**
 * Prepares a task document from a raw import row, resolving referenced entities.
 *
 * @param subdomain The active subdomain/tenant identifier.
 * @param models The connection models for database queries.
 * @param row The raw row key-value pairs from the imported file.
 * @param userMap A lookup map resolving assignee strings to user IDs.
 * @returns A promise resolving to the prepared task document.
 */
async function prepareTaskDoc(
  subdomain: string,
  models: IModels,
  row: Record<string, unknown>,
  userMap: Map<string, string>,
): Promise<TPreparedTaskDoc> {
  const doc: TImportTaskDoc = {};
  const errors: string[] = [];

  resolveNameAndDescription(row, doc, errors);
  const teamId = await resolveTaskTeamAndStatus(models, row, doc, errors);
  resolveTaskAssignee(row, userMap, doc, errors);
  await resolveTaskProjectAndMilestone(models, row, teamId, doc, errors);
  await resolveTaskCycle(models, row, teamId, doc, errors);
  resolveTaskPriorityEstimateAndDates(row, doc, errors);
  await resolveTaskTags(subdomain, row, doc, errors);
  await resolveTaskCustomProperties(subdomain, row, doc, errors);

  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }

  if (!isPreparedTaskDoc(doc)) {
    throw new Error('Required task fields were not resolved');
  }

  return doc;
}

/**
 * Safely registers a lookup key to a user ID. If the key is not unique (e.g., fullName/firstName/lastName)
 * and maps to a different user, it is flagged as 'AMBIGUOUS' to trigger validation on import.
 *
 * @param userMap The mapping dictionary.
 * @param key The identifier (name or ID).
 * @param id The resolved user ID.
 * @param isUniqueKey Whether the key is unique (e.g., _id or email).
 */
function setWithAmbiguityCheck(
  userMap: Map<string, string>,
  key: string,
  id: string,
  isUniqueKey: boolean,
): void {
  const lowerKey = key.toLowerCase().trim();
  if (!lowerKey) return;
  if (isUniqueKey) {
    userMap.set(lowerKey, id);
  } else {
    const existingVal = userMap.get(lowerKey);
    if (existingVal && existingVal !== id) {
      userMap.set(lowerKey, 'AMBIGUOUS');
    } else if (!existingVal) {
      userMap.set(lowerKey, id);
    }
  }
}

/**
 * Resolves all assignee strings to their user IDs by querying the users service via tRPC.
 *
 * @param subdomain The tenant subdomain.
 * @param rows The imported raw rows.
 * @returns A promise resolving to a lookup map from lowercase names/emails to user IDs.
 */
interface IUserToMap {
  _id?: unknown;
  email?: string;
  details?: { fullName?: string; firstName?: string; lastName?: string };
}

/**
 * Scans raw import rows and returns a unique set of non-empty assignee strings.
 */
function extractAssigneeValues(rows: Record<string, unknown>[]): Set<string> {
  const assigneeVals = new Set<string>();
  for (const row of rows) {
    const rawVal = row.assigneeId ?? row.Assignee ?? '';
    const val = safeString(rawVal).trim();
    if (val) {
      assigneeVals.add(val);
    }
  }
  return assigneeVals;
}

/**
 * Registers user identity lookups (IDs, emails, names) in the search mapping.
 */
function registerUserMappings(userMap: Map<string, string>, user: IUserToMap): void {
  if (!user._id) {
    return;
  }
  const idStr = stringifyId(user._id);
  setWithAmbiguityCheck(userMap, idStr, idStr, true);
  if (user.email) {
    setWithAmbiguityCheck(userMap, user.email, idStr, true);
  }
  if (user.details?.fullName) {
    setWithAmbiguityCheck(userMap, user.details.fullName, idStr, false);
  }
  if (user.details?.firstName) {
    setWithAmbiguityCheck(userMap, user.details.firstName, idStr, false);
  }
  if (user.details?.lastName) {
    setWithAmbiguityCheck(userMap, user.details.lastName, idStr, false);
  }
}

/**
 * Resolves all assignee strings to their user IDs by querying the users service via tRPC.
 *
 * @param subdomain The tenant subdomain.
 * @param rows The imported raw rows.
 * @returns A promise resolving to a lookup map from lowercase names/emails to user IDs.
 */
async function fetchAndBuildUserMap(
  subdomain: string,
  rows: Record<string, unknown>[],
): Promise<Map<string, string>> {
  const assigneeVals = extractAssigneeValues(rows);

  if (assigneeVals.size === 0) {
    return new Map<string, string>();
  }

  const users: IUserToMap[] = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'users',
    action: 'find',
    input: {
      query: {
        $or: [
          { _id: { $in: Array.from(assigneeVals) } },
          { email: { $in: Array.from(assigneeVals) } },
          { 'details.fullName': { $in: Array.from(assigneeVals) } },
          { 'details.firstName': { $in: Array.from(assigneeVals) } },
          { 'details.lastName': { $in: Array.from(assigneeVals) } },
        ],
      },
    },
    defaultValue: [],
  });

  const userMap = new Map<string, string>();

  for (const u of users) {
    registerUserMappings(userMap, u);
  }

  return userMap;
}

/**
 * Converts raw import rows into validated task documents, collecting row errors.
 */
async function prepareTaskRows(
  subdomain: string,
  models: IModels,
  rows: Record<string, unknown>[],
  userMap: Map<string, string>,
  errorRows: Record<string, unknown>[],
): Promise<TPreparedRowDoc[]> {
  const preparedRowDocs: TPreparedRowDoc[] = [];

  for (const row of rows) {
    try {
      const doc = await prepareTaskDoc(subdomain, models, row, userMap);
      preparedRowDocs.push({ row, doc });
    } catch (e) {
      errorRows.push({
        ...row,
        error: getErrorMessage(e),
      });
    }
  }

  return preparedRowDocs;
}

/**
 * Builds lookup conditions for imported rows that may update existing tasks.
 */
function buildExistingTaskConditions(
  preparedRowDocs: TPreparedRowDoc[],
): Array<Record<string, unknown>> {
  const orConditions: Array<Record<string, unknown>> = [];

  for (const { row, doc } of preparedRowDocs) {
    const rowIdVal = row._id ?? row.id;
    const idStr = safeString(rowIdVal).trim();
    if (idStr && mongoose.Types.ObjectId.isValid(idStr)) {
      orConditions.push({ _id: idStr });
    }

    orConditions.push({
      name: { $regex: `^${escapeRegExp(doc.name)}$`, $options: 'i' },
      teamId: doc.teamId,
    });
  }

  return orConditions;
}

/**
 * Indexes existing tasks by ID and by case-insensitive name/team pair.
 */
function indexExistingTasks(existingTasks: TExistingTask[]): TExistingTaskMaps {
  const byId = new Map<string, TExistingTask>();
  const byNameAndTeam = new Map<string, TExistingTask>();

  for (const task of existingTasks) {
    const id = toOptionalId(task._id);
    if (id) {
      byId.set(id, task);
    }

    const name = safeString(task.name);
    const teamId = toOptionalId(task.teamId);
    if (name && teamId) {
      byNameAndTeam.set(getTaskKey(name, teamId), task);
    }
  }

  return { byId, byNameAndTeam };
}

/**
 * Loads and indexes existing tasks that match the incoming task rows.
 */
async function fetchExistingTaskMaps(
  models: IModels,
  preparedRowDocs: TPreparedRowDoc[],
): Promise<TExistingTaskMaps> {
  const orConditions = buildExistingTaskConditions(preparedRowDocs);
  const existingTasks: TExistingTask[] = orConditions.length
    ? await models.Task.find({ $or: orConditions }).lean()
    : [];

  return indexExistingTasks(existingTasks);
}

/**
 * Finds an existing task for an import row by ID or name/team pair.
 */
function getExistingTask(
  row: Record<string, unknown>,
  doc: TPreparedTaskDoc,
  existingMaps: TExistingTaskMaps,
): TExistingTask | undefined {
  const rowIdVal = row._id ?? row.id;
  const idStr = safeString(rowIdVal).trim();
  if (idStr && mongoose.Types.ObjectId.isValid(idStr)) {
    const existingById = existingMaps.byId.get(idStr);
    if (existingById) {
      return existingById;
    }
  }

  return existingMaps.byNameAndTeam.get(getTaskKey(doc.name, doc.teamId));
}

/**
 * Adds a saved task to the in-memory lookup maps for subsequent rows.
 */
function rememberSavedTask(
  existingMaps: TExistingTaskMaps,
  task: ITaskDocument,
): void {
  const id = toOptionalId(task._id);
  if (id) {
    existingMaps.byId.set(id, task);
  }

  if (task.name && task.teamId) {
    existingMaps.byNameAndTeam.set(getTaskKey(task.name, task.teamId), task);
  }
}

/**
 * Publishes realtime task change events after a successful import save.
 */
function publishTaskChange(type: TTaskSaveType, task: ITaskDocument): void {
  graphqlPubsub.publish(`operationTaskChanged:${task._id}`, {
    operationTaskChanged: {
      type,
      task,
    },
  });

  graphqlPubsub.publish('operationTaskListChanged', {
    operationTaskListChanged: {
      type,
      task,
    },
  });
}

/**
 * Creates or updates a task through the task model service layer.
 */
async function saveTaskDoc({
  models,
  subdomain,
  userId,
  doc,
  existingTask,
}: {
  models: IModels;
  subdomain: string;
  userId: string;
  doc: TPreparedTaskDoc;
  existingTask?: TExistingTask;
}): Promise<TTaskSaveResult> {
  if (existingTask) {
    const _id = toOptionalId(existingTask._id);
    if (!_id) {
      throw new Error('Existing task id could not be resolved');
    }

    const updateDoc: ITaskUpdate = { ...doc, _id };
    const task = await models.Task.updateTask({ doc: updateDoc, userId, subdomain });
    return { task, type: 'update' };
  }

  const task = await models.Task.createTask({ doc, userId, subdomain });
  return { task, type: 'create' };
}

/**
 * Persists prepared task rows one-by-one and records per-row outcomes.
 */
async function savePreparedTaskRows(
  models: IModels,
  subdomain: string,
  userId: string,
  preparedRowDocs: TPreparedRowDoc[],
  existingMaps: TExistingTaskMaps,
  successRows: Record<string, unknown>[],
  errorRows: Record<string, unknown>[],
): Promise<void> {
  for (const { row, doc } of preparedRowDocs) {
    try {
      const existingTask = getExistingTask(row, doc, existingMaps);
      const result = await saveTaskDoc({
        models,
        subdomain,
        userId,
        doc,
        existingTask,
      });

      publishTaskChange(result.type, result.task);
      rememberSavedTask(existingMaps, result.task);
      successRows.push({ ...row, _id: result.task._id });
    } catch (e) {
      errorRows.push({ ...row, error: getErrorMessage(e) });
    }
  }
}

/**
 * Processes and saves a batch of imported task rows.
 *
 * @param subdomain The active subdomain/tenant identifier.
 * @param models The connection models for database queries.
 * @param rows An array of raw task records to import.
 * @param userId The user ID responsible for the import save operation.
 * @returns A promise resolving to an object containing successful and failed import rows.
 */
export async function processTaskRows(
  subdomain: string,
  models: IModels,
  rows: Record<string, unknown>[],
  userId: string,
): Promise<{ successRows: Record<string, unknown>[]; errorRows: Record<string, unknown>[] }> {
  const successRows: Record<string, unknown>[] = [];
  const errorRows: Record<string, unknown>[] = [];

  try {
    const userMap = await fetchAndBuildUserMap(subdomain, rows);
    const preparedRowDocs = await prepareTaskRows(
      subdomain,
      models,
      rows,
      userMap,
      errorRows,
    );

    if (preparedRowDocs.length === 0) {
      return { successRows, errorRows };
    }

    const existingMaps = await fetchExistingTaskMaps(models, preparedRowDocs);
    await savePreparedTaskRows(
      models,
      subdomain,
      userId,
      preparedRowDocs,
      existingMaps,
      successRows,
      errorRows,
    );

    return { successRows, errorRows };
  } catch (e) {
    const errorMessage = getErrorMessage(e);
    return {
      successRows: [],
      errorRows: rows.map((r) => ({
        ...r,
        error: errorMessage,
      })),
    };
  }
}
