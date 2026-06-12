import mongoose from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { STATUS_TYPES } from '@/status/constants/types';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { safeString, stringifyId } from '../utils';

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
  return val.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\\$&`);
}

interface ITaskDoc {
  name?: string;
  description?: string;
  teamId?: unknown;
  status?: unknown;
  statusType?: number;
  priority?: number;
  assigneeId?: string;
  projectId?: unknown;
  cycleId?: unknown;
  milestoneId?: unknown;
  estimatePoint?: number;
  startDate?: Date;
  targetDate?: Date;
  propertiesData?: Record<string, unknown>;
}

/**
 * Resolves the team ID by checking the provided team name/ID value.
 *
 * @param models The database models.
 * @param teamVal The raw team identifier value.
 * @returns A promise resolving to the team ID.
 */
async function resolveTeam(models: IModels, teamVal?: unknown): Promise<unknown> {
  const val = safeString(teamVal).trim();
  if (!val) {
    throw new Error('Team is required');
  }
  const team = await models.Team.findOne(nameOrIdFilter(val)).lean();
  if (!team) {
    throw new Error(`Team not found: "${val}"`);
  }
  return team._id;
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
): Promise<{ status: unknown; statusType: number }> {
  const val = safeString(statusVal).trim();
  if (val) {
    const statusDoc = await models.Status.findOne({
      teamId,
      name: { $regex: `^${escapeRegExp(val)}$`, $options: 'i' },
    }).lean();

    if (statusDoc) {
      return { status: statusDoc._id, statusType: statusDoc.type };
    }
  }

  // Fall back to Backlog
  const backlog = await models.Status.findOne({
    teamId,
    type: STATUS_TYPES.BACKLOG,
  }).lean();
  if (backlog) {
    return { status: backlog._id, statusType: backlog.type };
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
  return PRIORITY_BY_LABEL.get(val.toLowerCase());
}

/**
 * Resolves the project ID based on the project identifier value.
 *
 * @param models The database models.
 * @param projectVal The raw project identifier value.
 * @returns A promise resolving to the project ID.
 */
async function resolveProject(models: IModels, projectVal?: unknown): Promise<unknown> {
  const val = safeString(projectVal).trim();
  if (!val) {
    return undefined;
  }
  const project = await models.Project.findOne(nameOrIdFilter(val)).lean();
  if (!project) {
    throw new Error(`Project not found: "${val}"`);
  }
  return project._id;
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
): Promise<unknown> {
  const val = safeString(cycleVal).trim();
  if (!val) {
    return undefined;
  }
  const cycle = await models.Cycle.findOne({
    ...nameOrIdFilter(val),
    teamId,
  }).lean();
  return cycle?._id;
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
): Promise<unknown> {
  const val = safeString(milestoneVal).trim();
  if (!val || !projectId) {
    return undefined;
  }
  const milestone = await models.Milestone.findOne({
    ...nameOrIdFilter(val),
    projectId,
  }).lean();
  return milestone?._id;
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
 * Prepares a task document from a raw import row, resolving referenced entities.
 *
 * @param models The connection models for database queries.
 * @param row The raw row key-value pairs from the imported file.
 * @param userMap A lookup map resolving assignee strings to user IDs.
 * @returns A promise resolving to the prepared task document.
 */
async function prepareTaskDoc(
  models: IModels,
  row: Record<string, unknown>,
  userMap: Map<string, string>,
): Promise<ITaskDoc> {
  const doc: ITaskDoc = {};

  // --- Required: Name ---
  const rawName = row.name ?? row.Name ?? '';
  const name = safeString(rawName).trim();
  if (!name) {
    throw new Error('Name is required');
  }
  doc.name = name;

  // --- Description ---
  const rawDescription = row.description ?? row.Description ?? '';
  const description = safeString(rawDescription).trim();
  if (description) {
    doc.description = description;
  }

  // --- Required: Team ---
  doc.teamId = await resolveTeam(models, row.teamId ?? row.Team);

  // --- Status ---
  const statusInfo = await resolveStatus(models, doc.teamId, row.status ?? row.Status);
  doc.status = statusInfo.status;
  doc.statusType = statusInfo.statusType;

  // --- Priority ---
  doc.priority = resolvePriority(row.priority ?? row.Priority);

  // --- Assignee ---
  const rawAssigneeVal = row.assigneeId ?? row.Assignee ?? '';
  const assigneeVal = safeString(rawAssigneeVal).trim();
  if (assigneeVal) {
    const resolvedId = userMap.get(assigneeVal.toLowerCase());
    if (!resolvedId) {
      throw new Error(`Assignee user not found: "${assigneeVal}"`);
    }
    if (resolvedId === 'AMBIGUOUS') {
      throw new Error(`Assignee identifier "${assigneeVal}" is ambiguous. Please use a more specific identifier like email or User ID.`);
    }
    doc.assigneeId = resolvedId;
  }

  // --- Project ---
  doc.projectId = await resolveProject(models, row.projectId ?? row.Project);

  // --- Cycle ---
  doc.cycleId = await resolveCycle(models, doc.teamId, row.cycleId ?? row.Cycle);

  // --- Milestone ---
  doc.milestoneId = await resolveMilestone(models, doc.projectId, row.milestoneId ?? row.Milestone);

  // --- Estimate Point ---
  doc.estimatePoint = resolveEstimate(row.estimatePoint ?? row['Estimate Point']);

  // --- Dates ---
  const dates = resolveDates(
    row.startDate ?? row['Start Date'],
    row.targetDate ?? row['Due Date'],
  );
  doc.startDate = dates.startDate;
  doc.targetDate = dates.targetDate;

  // --- Custom properties passthrough ---
  for (const key of Object.keys(row)) {
    if (key.startsWith('propertiesData.')) {
      doc.propertiesData ??= {};
      const fieldId = key.slice('propertiesData.'.length);
      doc.propertiesData[fieldId] = row[key];
    }
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

interface IBulkWriteError {
  name?: string;
  message?: string;
  result?: { insertedIds?: Record<number, unknown> };
  writeErrors?: Array<{ index: number; errmsg?: string }>;
}

/**
 * Resolves per-row outcomes from a MongoBulkWriteError.
 */
function handleBulkWriteError(
  errObj: IBulkWriteError,
  rowDocs: Array<{ row: Record<string, unknown>; doc: ITaskDoc }>,
  successRows: Record<string, unknown>[],
  errorRows: Record<string, unknown>[],
): void {
  const insertedIds = errObj.result?.insertedIds || {};
  const writeErrors = errObj.writeErrors || [];
  const errorIndices = new Set(writeErrors.map((err) => err.index));

  for (let i = 0; i < rowDocs.length; i++) {
    const { row } = rowDocs[i];
    if (errorIndices.has(i)) {
      const err = writeErrors.find((we) => we.index === i);
      errorRows.push({ ...row, error: err?.errmsg || 'Insert failed' });
    } else {
      const insertedId = insertedIds[i] ?? (row._id || null);
      successRows.push({ ...row, _id: insertedId });
    }
  }
}

/**
 * Executes a MongoDB bulkWrite and handles per-row success/error output.
 *
 * @param models The database models.
 * @param operations The operations list.
 * @param rowDocs Prepared rows mapping.
 * @param successRows Destination array for successful rows.
 * @param errorRows Destination array for failed rows.
 */
async function executeBulkWrite(
  models: IModels,
  operations: Array<{ insertOne: { document: ITaskDoc } }>,
  rowDocs: Array<{ row: Record<string, unknown>; doc: ITaskDoc }>,
  successRows: Record<string, unknown>[],
  errorRows: Record<string, unknown>[],
): Promise<void> {
  try {
    const result = await models.Task.bulkWrite(operations, { ordered: false });

    for (let i = 0; i < rowDocs.length; i++) {
      const { row } = rowDocs[i];
      successRows.push({ ...row, _id: result.insertedIds[i] });
    }
  } catch (error) {
    const errObj = error as IBulkWriteError;

    if (errObj.name === 'MongoBulkWriteError' || errObj.name === 'BulkWriteError') {
      handleBulkWriteError(errObj, rowDocs, successRows, errorRows);
    } else {
      const errMsg = errObj.message || 'Insert failed';
      for (const { row } of rowDocs) {
        errorRows.push({ ...row, error: errMsg });
      }
    }
  }
}

/**
 * Processes and saves a batch of imported task rows.
 *
 * @param subdomain The active subdomain/tenant identifier.
 * @param models The connection models for database queries.
 * @param rows An array of raw task records to import.
 * @returns A promise resolving to an object containing successful and failed import rows.
 */
export async function processTaskRows(
  subdomain: string,
  models: IModels,
  rows: Record<string, unknown>[],
): Promise<{ successRows: Record<string, unknown>[]; errorRows: Record<string, unknown>[] }> {
  const successRows: Record<string, unknown>[] = [];
  const errorRows: Record<string, unknown>[] = [];

  try {
    const userMap = await fetchAndBuildUserMap(subdomain, rows);

    const operations: Array<{ insertOne: { document: ITaskDoc } }> = [];
    const rowDocs: Array<{ row: Record<string, unknown>; doc: ITaskDoc }> = [];

    for (const row of rows) {
      try {
        const doc = await prepareTaskDoc(models, row, userMap);
        operations.push({ insertOne: { document: doc } });
        rowDocs.push({ row, doc });
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        errorRows.push({
          ...row,
          error: errorMessage,
        });
      }
    }

    if (operations.length) {
      await executeBulkWrite(models, operations, rowDocs, successRows, errorRows);
    }

    return { successRows, errorRows };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    return {
      successRows: [],
      errorRows: rows.map((r) => ({
        ...r,
        error: errorMessage,
      })),
    };
  }
}
