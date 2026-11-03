import { Document } from 'mongoose';
import { ActivityLogInput } from '..';
import { logActivityLogError } from './activityLog/utils';

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
  context?: {
    text?: string;
    data?: any;
  };
  metadata?: Record<string, any>;
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

  const visitedPairs = new WeakMap<object, WeakSet<object>>();

  const isPlainObject = (val: any): val is Record<string, any> => {
    if (val === null || typeof val !== 'object' || Array.isArray(val)) {
      return false;
    }

    const proto = Object.getPrototypeOf(val);
    return proto === Object.prototype || proto === null;
  };

  const isEmptyLikeScalar = (val: any) =>
    val === undefined || val === null || val === '';

  const isEquivalentEmptyValue = (prev: any, curr: any) =>
    isEmptyLikeScalar(prev) && isEmptyLikeScalar(curr);

  const isDate = (val: any): val is Date => val instanceof Date;

  const isObjectId = (val: any): boolean =>
    val !== null &&
    typeof val === 'object' &&
    typeof val.toHexString === 'function';

  const markVisitedPair = (prev: any, curr: any) => {
    if (
      prev === null ||
      curr === null ||
      typeof prev !== 'object' ||
      typeof curr !== 'object'
    ) {
      return false;
    }

    let seen = visitedPairs.get(prev);
    if (!seen) {
      seen = new WeakSet<object>();
      visitedPairs.set(prev, seen);
    }

    if (seen.has(curr)) {
      return true;
    }

    seen.add(curr);
    return false;
  };

  const areArraysShallowEqual = (prevArr: any[], currArr: any[]) => {
    if (prevArr.length !== currArr.length) {
      return false;
    }

    for (let i = 0; i < prevArr.length; i++) {
      const a = prevArr[i];
      const b = currArr[i];

      if (Object.is(a, b)) {
        continue;
      }

      if (isDate(a) && isDate(b) && a.getTime() === b.getTime()) {
        continue;
      }

      return false;
    }

    return true;
  };

  function walk(prev: any, curr: any, path: string[]): void {
    if (Object.is(prev, curr)) {
      return;
    }

    if (isEquivalentEmptyValue(prev, curr)) {
      return;
    }

    if (markVisitedPair(prev, curr)) {
      return;
    }

    if (Array.isArray(prev) || Array.isArray(curr)) {
      const prevArr = Array.isArray(prev) ? prev : [];
      const currArr = Array.isArray(curr) ? curr : [];

      if (!areArraysShallowEqual(prevArr, currArr)) {
        changes.push({
          field: path.join('.'),
          prev,
          current: curr,
          kind: 'array',
        });
      }

      return;
    }

    if (isObjectId(prev) || isObjectId(curr)) {
      const prevStr = isObjectId(prev) ? prev.toHexString() : prev;
      const currStr = isObjectId(curr) ? curr.toHexString() : curr;

      if (!Object.is(prevStr, currStr)) {
        const kind: NormalizedChange['kind'] =
          prev === undefined ? 'set' : curr === undefined ? 'unset' : 'update';

        changes.push({ field: path.join('.'), prev, current: curr, kind });
      }

      return;
    }

    if (isDate(prev) || isDate(curr)) {
      const prevTime = isDate(prev) ? prev.getTime() : prev;
      const currTime = isDate(curr) ? curr.getTime() : curr;

      if (!Object.is(prevTime, currTime)) {
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

      return;
    }

    if (isPlainObject(prev) && isPlainObject(curr)) {
      const keys = new Set([...Object.keys(prev), ...Object.keys(curr)]);

      for (const key of keys) {
        walk(prev[key], curr[key], [...path, key]);
      }

      return;
    }

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
  return str.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
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
    const regexPattern = escapedPattern.replaceAll(/\\*/g, '.*'); // Convert * to .*
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
    const normalizedFieldLabel = String(fieldLabel || field).toLowerCase();
    const formatDescriptionValue = (value: any) => {
      if (value === null || value === undefined || value === '') {
        return 'empty';
      }

      if (typeof value === 'boolean') {
        return value ? 'yes' : 'no';
      }

      if (Array.isArray(value)) {
        return value.length ? value.join(', ') : 'empty';
      }

      if (typeof value === 'object') {
        return JSON.stringify(value);
      }

      return String(value);
    };

    const previousValueLabel = formatDescriptionValue(prev);
    const currentValueLabel = formatDescriptionValue(current);
    const description =
      actionLabel === 'set'
        ? `set ${normalizedFieldLabel} to ${currentValueLabel}`
        : actionLabel === 'unset'
          ? `cleared ${normalizedFieldLabel}`
          : `changed ${normalizedFieldLabel} from ${previousValueLabel} to ${currentValueLabel}`;

    return [
      {
        activityType: 'field_changed',
        action: {
          type: actionLabel,
          description,
        },
        metadata: {
          field,
          fieldLabel,
          valueLabel,
          previousValueLabel,
          currentValueLabel,
        },
        changes: {
          prev: {
            [field]: prev,
          },
          current: {
            [field]: current,
          },
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
      const labels = Array.isArray(contextNames)
        ? contextNames
        : [contextNames].filter(Boolean);
      payloads.push({
        activityType: 'assignment',
        action: {
          type: addedAction,
          description: `${addedAction} ${field
            .replace(/Ids$/, '')
            .toLowerCase()}`,
        },
        context: {
          text: labels.join(', '),
          data: labels,
        },
        metadata: {
          field,
          entityLabel: field.replace(/Ids$/, '').toLowerCase(),
        },
        changes: { added },
      });
    }

    if (removed.length) {
      const contextNames = await getContextNames(removed);
      const labels = Array.isArray(contextNames)
        ? contextNames
        : [contextNames].filter(Boolean);

      payloads.push({
        activityType: 'assignment',
        action: {
          type: removedAction,
          description: `${removedAction} ${field
            .replace(/Ids$/, '')
            .toLowerCase()}`,
        },
        context: {
          text: labels.join(', '),
          data: labels,
        },
        metadata: {
          field,
          entityLabel: field.replace(/Ids$/, '').toLowerCase(),
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
  const activities: BulkActivityResult[] = [];
  try {
    const {
      field,
      getFieldLabel,
      getContextNames,
      activityTypeMap = {},
      actionTypeMap = {},
      getActivityType,
      getActionType,
    } = config;

    const {
      array: arrayActivityType = 'assignment',
      fieldChange: fieldChangeActivityType = 'field_changed',
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
      try {
        const prevValue = target[field];
        const currentValue = changes[matchingChangeKey];

        if (Array.isArray(prevValue) || Array.isArray(currentValue)) {
          const prevIds = Array.isArray(prevValue) ? prevValue : [];
          const currentIds = Array.isArray(currentValue) ? currentValue : [];

          const added = currentIds.filter(
            (id: string) => !prevIds.includes(id),
          );
          const removed = prevIds.filter(
            (id: string) => !currentIds.includes(id),
          );

          if (added.length > 0) {
            const activityType = getActivityType
              ? await getActivityType(field, true)
              : arrayActivityType;
            const actionType = getActionType
              ? await getActionType(field, 'added')
              : addedAction;
            let contextText = '';
            let contextData: string[] = [];

            let description = `${actionType}`;
            if (getContextNames) {
              const contextNames = await getContextNames(added);
              const labels = Array.isArray(contextNames)
                ? contextNames
                : [contextNames].filter(Boolean);

              contextText = labels.join(', ');
              contextData = labels;
              description = contextText
                ? `${actionType} to ${contextText}`
                : `${actionType}`;
            }

            activities.push({
              activityType,
              action: {
                type: actionType,
                description,
              },
              context: {
                text: contextText,
                data: contextData,
              },
              metadata: {
                field,
                entityLabel: field.replace(/Ids$/, '').toLowerCase(),
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
            let contextText = '';
            let contextData: string[] = [];

            let description = `${actionType}`;
            if (getContextNames) {
              const contextNames = await getContextNames(removed);
              const labels = Array.isArray(contextNames)
                ? contextNames
                : [contextNames].filter(Boolean);

              contextText = labels.join(', ');
              contextData = labels;
              description = contextText
                ? `${actionType} from ${contextText}`
                : `${actionType}`;
            }

            activities.push({
              activityType,
              action: {
                type: actionType,
                description,
              },
              context: {
                text: contextText,
                data: contextData,
              },
              metadata: {
                field,
                entityLabel: field.replace(/Ids$/, '').toLowerCase(),
              },
              changes: { removed },
              target: {
                _id: target._id,
              },
            });
          }
        } else if (prevValue !== currentValue) {
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
      } catch (error) {
        logActivityLogError('buildBulkActivities target', error, {
          targetId: target?._id,
        });
      }
    }

    if (activities.length > 0) {
      try {
        createActivityLog(
          activities.map((activity) => ({
            ...activity,
            ...commonActivityData,
          })),
        );
      } catch (error) {
        logActivityLogError('buildBulkActivities dispatch', error, {
          field: config.field,
        });
      }
    }
  } catch (error) {
    logActivityLogError('buildBulkActivities', error, {
      field: config?.field,
    });
  }

  return activities;
}

export async function buildActivities(
  prevDoc: any | Document<any>,
  currentDoc: any | Document<any>,
  activityRegistry: ActivityRule[],
) {
  const activities: ActivityLogPayload[] = [];
  let changes: NormalizedChange[] = [];

  try {
    const prevPlain =
      typeof (prevDoc as any)?.toObject === 'function'
        ? (prevDoc as any).toObject()
        : prevDoc;

    const currentPlain =
      typeof (currentDoc as any)?.toObject === 'function'
        ? (currentDoc as any).toObject()
        : currentDoc;

    changes = normalizeDiffs(prevPlain, currentPlain);
  } catch (error) {
    logActivityLogError('buildActivities setup', error, {
      targetId: currentDoc?._id ?? prevDoc?._id,
    });
    return activities;
  }

  for (const change of changes) {
    for (const rule of activityRegistry) {
      try {
        if (!rule.match(change)) {
          continue;
        }

        const result = await rule.build(change);

        if (Array.isArray(result) && result.length > 0) {
          activities.push(...result);
        }
      } catch (error) {
        logActivityLogError('buildActivities change', error, {
          field: change.field,
          targetId: currentDoc?._id ?? prevDoc?._id,
        });
      }
    }
  }

  return activities;
}
