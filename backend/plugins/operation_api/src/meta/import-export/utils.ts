import { ImportHeaderDefinition } from 'erxes-api-shared/core-modules';
import { getRealIdFromElk, sendTRPCMessage } from 'erxes-api-shared/utils';

import { STATUS_TYPES } from '@/status/constants/types';

/**
 * Safely converts an object to a string representation, resolving custom toHexString or toString methods.
 *
 * @param obj The object to convert.
 * @returns The resolved string, or undefined if no custom stringifier is found.
 */
function stringifyObject(obj: Record<string, unknown>): string | undefined {
  if (typeof obj.toHexString === 'function') {
    return obj.toHexString();
  }
  const toStringFn = obj.toString;
  if (typeof toStringFn === 'function' && toStringFn !== Object.prototype.toString) {
    return toStringFn.call(obj);
  }
  return undefined;
}

/**
 * Safely converts an identifier (which can be a string, number, or Mongo ObjectId) to a string.
 */
export function stringifyId(id: unknown): string {
  if (!id) return '';
  if (typeof id === 'string') return id;
  if (typeof id === 'number') return String(id);
  if (typeof id === 'object') {
    const str = stringifyObject(id as Record<string, unknown>);
    if (str !== undefined) return str;
  }
  return '';
}

/**
 * Safely converts an unknown value (usually cell value from excel/csv) to a string,
 * avoiding object stringification like [object Object] and handling dates.
 */
export function safeString(val: unknown): string {
  if (val === null || val === undefined) {
    return '';
  }
  if (typeof val === 'string') {
    return val;
  }
  if (typeof val === 'number' || typeof val === 'boolean') {
    return String(val);
  }
  if (val instanceof Date) {
    return val.toISOString();
  }
  return '';
}

export const TASK_CONTENT_TYPE = 'operation:task';
export const PROJECT_CONTENT_TYPE = 'operation:project';

export const PRIORITY_LABELS: Record<number, string> = {
  0: 'No Priority',
  1: 'Minor',
  2: 'Medium',
  3: 'High',
  4: 'Critical',
};

export const STATUS_TYPE_LABELS: Record<number, string> = {
  [STATUS_TYPES.STARTED]: 'In Progress',
  [STATUS_TYPES.UNSTARTED]: 'Todo',
  [STATUS_TYPES.BACKLOG]: 'Backlog',
  [STATUS_TYPES.COMPLETED]: 'Done',
  [STATUS_TYPES.CANCELLED]: 'Cancelled',
  [STATUS_TYPES.TRIAGE]: 'Triage',
};

/**
 * Joins a list of names/IDs using a semicolon separator.
 */
export const joinNames = (ids: unknown[] | undefined, map: Map<string, string>): string => {
  if (!ids?.length) return '';
  return ids
    .map((id) => map.get(stringifyId(id)) || '')
    .filter(Boolean)
    .join('; ');
};

/**
 * Formats a value as a string, returning an empty string if null or undefined,
 * and avoiding default object stringification [object Object].
 */
export const formatValue = (value: unknown): string => {
  if (value == null) return '';
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.map(formatValue).join(', ');
    }
    if (value instanceof Date) {
      return value.toISOString();
    }
    const str = stringifyObject(value as Record<string, unknown>);
    if (str !== undefined) return str;
    return JSON.stringify(value);
  }
  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint' ||
    typeof value === 'symbol'
  ) {
    return String(value);
  }

  if (typeof value === 'string') {
    return value;
  }

  return '';
};

/**
 * Formats a date to ISO string format, returning an empty string if invalid or empty.
 */
export const formatDate = (dateValue: Date | string | undefined): string => {
  if (!dateValue) return '';
  const parsedDate = new Date(dateValue);
  return Number.isNaN(parsedDate.getTime()) ? '' : parsedDate.toISOString();
};

/**
 * Retrieves custom property headers for a given contentType from the core fields service.
 *
 * @param subdomain The active subdomain/tenant identifier.
 * @param contentType The content type to query (e.g. TASK_CONTENT_TYPE, PROJECT_CONTENT_TYPE).
 * @returns A promise resolving to an array of import/export header definitions.
 */
export const getCustomPropertyHeaders = async (
  subdomain: string,
  contentType: string,
): Promise<ImportHeaderDefinition[]> => {
  const fields: Record<string, unknown>[] = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'fields',
    action: 'find',
    input: {
      query: { contentType },
      projection: null,
      sort: { order: 1 },
    },
    defaultValue: [],
  });

  if (!fields?.length) return [];

  const groupIds = fields
    .map((f) => f.groupId)
    .filter(Boolean)
    .map(stringifyId);

  const groups: Record<string, unknown>[] = groupIds.length
    ? await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'query',
        module: 'fieldsGroups',
        action: 'find',
        input: { query: { _id: { $in: groupIds } } },
        defaultValue: [],
      })
    : [];

  const groupById = new Map(groups.map((g) => [stringifyId(g._id), g]));

  return fields.map((field) => {
    const group = field.groupId ? groupById.get(stringifyId(field.groupId)) : null;
    const fieldId = getRealIdFromElk(stringifyId(field._id));
    const groupName = group && typeof group.name === 'string' ? group.name : null;
    const fieldName = typeof field.name === 'string' ? field.name : '';
    const fieldCode = typeof field.code === 'string' ? field.code : '';
    const label = groupName ? `${groupName} / ${fieldName}` : fieldName;
    const uniqueLabel = fieldCode ? `${label} [${fieldCode}]` : label;
    const key = `propertiesData.${fieldId}`;

    return {
      label: uniqueLabel,
      key,
      aliases: [
        label,
        fieldName,
        fieldCode,
        fieldCode ? `${fieldName} [${fieldCode}]` : '',
        key,
      ].filter(Boolean),
      type: 'customProperty' as const,
    };
  });
};

/**
 * Retrieves the custom property header definitions for tasks from the core fields service.
 *
 * @param subdomain The active subdomain/tenant identifier.
 * @returns A promise resolving to an array of import/export header definitions.
 */
export const getTaskCustomPropertyHeaders = (
  subdomain: string,
): Promise<ImportHeaderDefinition[]> => getCustomPropertyHeaders(subdomain, TASK_CONTENT_TYPE);


/**
 * Resolves the final list of export header definitions by combining system fields and custom property fields.
 *
 * @param subdomain The active subdomain/tenant identifier.
 * @param systemFields The default static system fields.
 * @param contentType The content type (e.g. TASK_CONTENT_TYPE).
 * @returns A promise resolving to combined import/export header definitions.
 */
export async function resolveExportHeaders(
  subdomain: string,
  systemFields: ImportHeaderDefinition[],
  contentType: string,
): Promise<ImportHeaderDefinition[]> {
  const customFields = await getCustomPropertyHeaders(subdomain, contentType);
  return [...systemFields, ...customFields];
}

export const EXPORT_HEADER_CONFIG = {
  task: {
    type: TASK_CONTENT_TYPE,
    fields: [
      { label: 'Name', key: 'name', isDefault: true },
      { label: 'Description', key: 'description' },
      { label: 'Status', key: 'status', isDefault: true },
      { label: 'Status Type', key: 'statusType', isDefault: true },
      { label: 'Priority', key: 'priority', isDefault: true },
      { label: 'Team', key: 'teamId', isDefault: true },
      { label: 'Assignee', key: 'assigneeId', isDefault: true },
      { label: 'Created By', key: 'createdBy' },
      { label: 'Project', key: 'projectId' },
      { label: 'Cycle', key: 'cycleId' },
      { label: 'Milestone', key: 'milestoneId' },
      { label: 'Tags', key: 'tagIds' },
      { label: 'Estimate Point', key: 'estimatePoint' },
      { label: 'Number', key: 'number' },
      { label: 'Start Date', key: 'startDate' },
      { label: 'Due Date', key: 'targetDate' },
      { label: 'Created At', key: 'createdAt', isDefault: true },
      { label: 'Updated At', key: 'updatedAt' },
    ] as ImportHeaderDefinition[],
  },
  project: {
    type: PROJECT_CONTENT_TYPE,
    fields: [
      { label: 'Name', key: 'name', isDefault: true },
      { label: 'Description', key: 'description' },
      { label: 'Status', key: 'status', isDefault: true },
      { label: 'Priority', key: 'priority', isDefault: true },
      { label: 'Teams', key: 'teamIds', isDefault: true },
      { label: 'Lead', key: 'leadId', isDefault: true },
      { label: 'Members', key: 'memberIds' },
      { label: 'Tags', key: 'tagIds' },
      { label: 'Start Date', key: 'startDate' },
      { label: 'Due Date', key: 'targetDate' },
      { label: 'Created At', key: 'createdAt', isDefault: true },
      { label: 'Updated At', key: 'updatedAt' },
    ] as ImportHeaderDefinition[],
  },
};

/**
 * Retrieves custom property headers combined with system fields based on the export configuration.
 *
 * @param type The type of entity ('task' | 'project').
 * @param subdomain The active subdomain/tenant identifier.
 * @returns A promise resolving to combined import/export header definitions.
 */
export async function getExportHeaders(
  type: 'task' | 'project',
  subdomain: string,
): Promise<ImportHeaderDefinition[]> {
  const config = EXPORT_HEADER_CONFIG[type];
  return await resolveExportHeaders(subdomain, config.fields, config.type);
}

/**
 * Builds a user ID-to-display name lookup map from member/user documents.
 */
export function buildUserMap(members: unknown[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const m of members as Array<Record<string, unknown>>) {
    const item = m as {
      _id: unknown;
      details?: { fullName?: string; firstName?: string; lastName?: string };
      email?: string;
    };
    const name =
      item.details?.fullName ||
      `${item.details?.firstName || ''} ${item.details?.lastName || ''}`.trim() ||
      item.email ||
      '';
    map.set(stringifyId(item._id), name);
  }
  return map;
}

/**
 * Builds a simple ID-to-name lookup map from documents.
 */
export function buildIdNameMap(items: unknown[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const item of items as Array<Record<string, unknown>>) {
    const doc = item as { _id: unknown; name?: string };
    map.set(stringifyId(doc._id), doc.name || '');
  }
  return map;
}

/**
 * Looks up a value in a Map by ID, returning a formatted fallback or empty string.
 */
export function getMapValue(id: unknown, map?: Map<string, string>): string {
  if (!id || !map) return '';
  return map.get(stringifyId(id)) || '';
}

/**
 * Returns the status type label based on the status value.
 */
export function getStatusLabel(status: unknown): string {
  if (status == null) return '';
  const num = Number(status);
  return STATUS_TYPE_LABELS[num] || formatValue(status);
}

/**
 * Returns the priority label based on the priority value.
 */
export function getPriorityLabel(priority: unknown): string {
  if (priority == null) return '';
  const num = Number(priority);
  return PRIORITY_LABELS[num] || formatValue(priority);
}

/**
 * Appends custom properties data to export fields and handles selected fields filtering.
 */
export function finalizeExportRow(
  _id: unknown,
  allFields: Record<string, string>,
  propertiesData?: Record<string, unknown>,
  selectedFields?: string[],
): Record<string, string> {
  if (propertiesData && typeof propertiesData === 'object') {
    for (const [fieldId, value] of Object.entries(propertiesData)) {
      if (value !== undefined && value !== null) {
        allFields[`propertiesData.${fieldId}`] = formatValue(value);
      }
    }
  }

  if (selectedFields?.length) {
    const result: Record<string, string> = { _id: stringifyId(_id) };
    for (const key of selectedFields) {
      if (key.startsWith('propertiesData.')) {
        const fieldId = key.slice('propertiesData.'.length);
        result[key] = formatValue(propertiesData?.[fieldId]);
      } else {
        result[key] = allFields[key] ?? '';
      }
    }
    return result;
  }

  return allFields;
}

