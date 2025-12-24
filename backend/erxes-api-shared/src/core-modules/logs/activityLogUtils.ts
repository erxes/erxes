import { Document } from 'mongoose';
import { ActivityLogInput } from '..';

export interface NormalizedChange {
  field: string; // details.firstName
  prev: any;
  current: any;
  kind: 'set' | 'update' | 'array' | 'unset';
}

interface ActivityLogPayload {
  activityType: string;
  action: {
    type: string;
    description: string;
  };
  changes: {
    prev?: any;
    current?: any;
    added?: any;
    removed?: any;
  };
}

export function normalizeDiffs(
  prevDoc: any,
  currentDoc: any,
): NormalizedChange[] {
  const changes: NormalizedChange[] = [];

  const visited = new WeakSet<object>();

  const isPlainObject = (val: any): val is Record<string, any> =>
    val !== null && typeof val === 'object' && !Array.isArray(val);

  function walk(prev: any, curr: any, path: string[]): void {
    // Same reference → skip
    if (prev === curr) return;

    // Cycle protection
    if (isPlainObject(prev)) {
      if (visited.has(prev)) return;
      visited.add(prev);
    }
    if (isPlainObject(curr)) {
      if (visited.has(curr)) return;
      visited.add(curr);
    }

    // Arrays → atomic diff with deep equality check
    if (Array.isArray(prev) || Array.isArray(curr)) {
      const prevArr = Array.isArray(prev) ? prev : [];
      const currArr = Array.isArray(curr) ? curr : [];

      const sameLength = prevArr.length === currArr.length;
      const sameItems =
        sameLength && prevArr.every((v, i) => Object.is(v, currArr[i]));

      if (!sameItems) {
        changes.push({
          field: path.join('.'),
          prev,
          current: curr,
          kind: 'array',
        });
      }
      return;
    }

    // Both plain objects → recurse
    if (isPlainObject(prev) && isPlainObject(curr)) {
      const keys = new Set([...Object.keys(prev), ...Object.keys(curr)]);

      for (const key of keys) {
        walk(prev[key], curr[key], [...path, key]);
      }
      return;
    }

    // Primitive / terminal value
    let kind: NormalizedChange['kind'] = 'update';

    if (prev === undefined && curr !== undefined) {
      kind = 'set';
    } else if (prev !== undefined && curr === undefined) {
      kind = 'unset';
    }

    changes.push({
      field: path.join('.'),
      prev,
      current: curr,
      kind,
    });
  }

  walk(prevDoc, currentDoc, []);

  return changes;
}

export interface ActivityRule {
  match: (change: NormalizedChange) => boolean;
  build: (change: NormalizedChange) => Promise<ActivityLogPayload[]>;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function matchesFieldPattern(field: string, pattern: string): boolean {
  // Exact match
  if (field === pattern) {
    return true;
  }

  // Wildcard pattern matching
  if (pattern.includes('*')) {
    // Convert pattern to regex: "links.*" -> "^links\\..*$"
    const escapedPattern = escapeRegex(pattern);
    const regexPattern = escapedPattern.replace(/\\\*/g, '.*'); // Convert * to .*
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(field);
  }

  return false;
}

export const fieldChangeRule = (
  fields: string[],
  action: string,
  getFieldLabel: (
    field: string,
    { current, prev }: { current: any; prev: any },
  ) => string | Promise<string>,
  getValueLabel?: (value: any) => string | Promise<string>,
): ActivityRule => ({
  match: ({ field }) =>
    fields.some((pattern) => matchesFieldPattern(field, pattern)),

  build: async ({ field, prev, current, kind }) => {
    const fieldLabel = await getFieldLabel(field, { current, prev });
    const actionLabel = action === 'unset' ? kind : action;
    const valueLabel = getValueLabel
      ? await getValueLabel(current)
      : current || 'unknown';
    const description = `${actionLabel} ${fieldLabel} to ${valueLabel}`;

    return [
      {
        activityType: 'field_change',
        action: {
          type: actionLabel,
          description,
        },
        changes: {
          prev,
          current,
        },
      },
    ];
  },
});

export const assignmentRule = (
  field: string,
  getContextNames: (ids: string[]) => Promise<string | string[]>,
  actionMap?: { added: string; removed: string },
): ActivityRule => ({
  match: ({ field: f, kind }) => f === field && kind === 'array',

  build: async ({ prev, current }) => {
    const prevIds = prev ?? [];
    const currentIds = current ?? [];

    const added = currentIds.filter((id: string) => !prevIds.includes(id));
    const removed = prevIds.filter((id: string) => !currentIds.includes(id));

    const payloads: ActivityLogPayload[] = [];

    const {
      added: addedAction = 'assigned',
      removed: removedAction = 'unassigned',
    } = actionMap || {};

    if (added.length) {
      const contextNames = await getContextNames(added);
      payloads.push({
        activityType: 'assignment',
        action: {
          type: addedAction,
          description: `${addedAction} to ${contextNames}`,
        },
        changes: { added },
      });
    }

    if (removed.length) {
      const contextNames = await getContextNames(removed);

      payloads.push({
        activityType: 'assignment',
        action: {
          type: removedAction,
          description: `${removedAction} from ${contextNames}`,
        },
        changes: { removed },
      });
    }

    return payloads;
  },
});

export interface BulkActivityConfig {
  field: string;
  getFieldLabel?: (
    field: string,
    { current, prev }: { current: any; prev: any },
  ) => string | Promise<string>;
  getContextNames?: (ids: string[]) => Promise<string | string[]>;
  activityTypeMap?: {
    array?: string;
    fieldChange?: string;
  };
  actionTypeMap?: {
    added?: string;
    removed?: string;
    update?: string;
  };
  getActivityType?: (
    field: string,
    isArray: boolean,
  ) => string | Promise<string>;
  getActionType?: (
    field: string,
    kind: 'added' | 'removed' | 'update',
  ) => string | Promise<string>;
}

export interface BulkActivityTarget {
  _id: string;
  [key: string]: any;
}

export interface BulkActivityResult extends ActivityLogPayload {
  target: {
    _id: string;
    [key: string]: any;
  };
}

export async function buildBulkActivities(
  prevTargets: BulkActivityTarget[],
  changes: Record<string, any>,
  config: BulkActivityConfig,
  createActivityLog: (
    activities: ActivityLogInput | ActivityLogInput[],
  ) => void,
  commonActivityData: Record<string, any>,
): Promise<BulkActivityResult[]> {
  const {
    field,
    getFieldLabel,
    getContextNames,
    activityTypeMap = {},
    actionTypeMap = {},
    getActivityType,
    getActionType,
  } = config;

  const activities: BulkActivityResult[] = [];

  const {
    array: arrayActivityType = 'assignment',
    fieldChange: fieldChangeActivityType = 'field_change',
  } = activityTypeMap;

  const {
    added: addedAction = 'assigned',
    removed: removedAction = 'unassigned',
    update: updateAction = 'update',
  } = actionTypeMap;

  const matchingChangeKey = Object.keys(changes).find((key) =>
    matchesFieldPattern(key, field),
  );

  if (!matchingChangeKey) {
    return activities;
  }
  for (const target of prevTargets) {
    const prevValue = target[field];
    const currentValue = changes[matchingChangeKey];

    if (Array.isArray(prevValue) || Array.isArray(currentValue)) {
      const prevIds = Array.isArray(prevValue) ? prevValue : [];
      const currentIds = Array.isArray(currentValue) ? currentValue : [];

      const added = currentIds.filter((id: string) => !prevIds.includes(id));
      const removed = prevIds.filter((id: string) => !currentIds.includes(id));

      if (added.length > 0) {
        const activityType = getActivityType
          ? await getActivityType(field, true)
          : arrayActivityType;
        const actionType = getActionType
          ? await getActionType(field, 'added')
          : addedAction;

        let description = `${actionType}`;
        if (getContextNames) {
          const contextNames = await getContextNames(added);

          description = `${actionType} to ${contextNames}`;
        }

        activities.push({
          activityType,
          action: {
            type: actionType,
            description,
          },
          changes: { added },
          target: {
            _id: target._id,
          },
        });
      }

      if (removed.length > 0) {
        const activityType = getActivityType
          ? await getActivityType(field, true)
          : arrayActivityType;
        const actionType = getActionType
          ? await getActionType(field, 'removed')
          : removedAction;

        let description = `${actionType}`;
        if (getContextNames) {
          const contextNames = await getContextNames(removed);

          description = `${actionType} from ${contextNames}`;
        }

        activities.push({
          activityType,
          action: {
            type: actionType,
            description,
          },
          changes: { removed },
          target: {
            _id: target._id,
          },
        });
      }
    } else {
      if (prevValue !== currentValue) {
        const activityType = getActivityType
          ? await getActivityType(field, false)
          : fieldChangeActivityType;
        const actionType = getActionType
          ? await getActionType(field, 'update')
          : updateAction;

        let description = `${field} changed from ${prevValue} to ${currentValue}`;
        if (getFieldLabel) {
          const fieldLabel = await getFieldLabel(field, {
            current: currentValue,
            prev: prevValue,
          });
          description = `${actionType} ${fieldLabel} to ${currentValue}`;
        }

        activities.push({
          activityType,
          action: {
            type: actionType,
            description,
          },
          changes: {
            prev: prevValue,
            current: currentValue,
          },
          target: {
            _id: target._id,
          },
        });
      }
    }
  }

  console.log(
    'activities',
    activities.map((activity) => ({
      ...activity,
      ...commonActivityData,
    })),
  );

  createActivityLog(
    activities.map((activity) => ({
      ...activity,
      ...commonActivityData,
    })),
  );

  return activities;
}

export async function buildActivities(
  prevDoc: any | Document<any>,
  currentDoc: any | Document<any>,
  activityRegistry: ActivityRule[],
) {
  const prevPlain =
    typeof (prevDoc as any)?.toObject === 'function'
      ? (prevDoc as any).toObject()
      : prevDoc;

  const currentPlain =
    typeof (currentDoc as any)?.toObject === 'function'
      ? (currentDoc as any).toObject()
      : currentDoc;

  const changes = normalizeDiffs(prevPlain, currentPlain);
  console.log('changes', changes);
  const activities: ActivityLogPayload[] = [];

  for (const change of changes) {
    for (const rule of activityRegistry) {
      if (rule.match(change)) {
        activities.push(...(await rule.build(change)));
      }
    }
  }

  return activities;
}
