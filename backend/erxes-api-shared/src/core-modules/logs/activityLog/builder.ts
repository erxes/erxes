import { normalizeDiffs } from '../activityLogUtils';
import { Config } from './types';
import {
  detectAssignmentDelta,
  findResolver,
  matchesFieldPattern,
  getSnapshot,
} from './utils';
import { sendTRPCMessage } from '../../../utils/trpc';
import { json } from 'stream/consumers';

const PROPERTIES_DATA_PREFIX = 'propertiesData.';

function resolveActivityTarget(document: any, config: Config, ctx: any) {
  if (typeof config?.buildTarget === 'function') {
    return config.buildTarget(document, ctx);
  }

  return ctx?.activityTarget ?? ctx?.target;
}

async function buildPropertiesDataActivities(
  changes: {
    field: string;
    prev: unknown;
    current: unknown;
    kind: 'set' | 'update' | 'array' | 'unset';
  }[],
  ctx: any,
): Promise<any[]> {
  const propChanges = changes.filter(({ field }) =>
    field.startsWith(PROPERTIES_DATA_PREFIX),
  );
  const activityTarget = ctx?.activityTarget ?? ctx?.target;

  if (!propChanges.length || !ctx?.subdomain || !activityTarget) {
    return [];
  }

  const fieldIds = propChanges.map(({ field }) =>
    field.slice(PROPERTIES_DATA_PREFIX.length),
  );

  const fields: any[] = await sendTRPCMessage({
    subdomain: ctx.subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'fields',
    action: 'find',
    input: {
      query: { _id: { $in: fieldIds } },
      projection: { name: 1, type: 1, options: 1 },
      sort: {},
    },
    defaultValue: [],
  });

  const fieldMap = new Map(fields.map((f: any) => [String(f._id), f]));

  const activities: any[] = [];

  for (const { field, prev, current, kind } of propChanges) {
    const fieldId = field.slice(PROPERTIES_DATA_PREFIX.length);
    const fieldDef = fieldMap.get(fieldId);

    if (!fieldDef) {
      continue;
    }

    // Check if field type is multiselect or checkbox (array-like fields) - case insensitive
    const isMultiSelectOrCheckbox = ['multiselect', 'checkbox'].includes(
      fieldDef.type?.toLowerCase(),
    );

    // Treat multiselect/checkbox like assignments - detect added/removed items
    if (isMultiSelectOrCheckbox && kind === 'array') {
      const { added, removed } = detectAssignmentDelta(prev, current);

      if (!added.length && !removed.length) {
        continue;
      }

      activities.push({
        activityType: 'property.field_changed',
        target: activityTarget,
        action: {
          type: 'array',
          description: `changed ${fieldDef.name}`,
        },
        changes: {
          fieldId,
          fieldName: fieldDef.name,
          fieldType: fieldDef.type,
          fieldOptions: fieldDef.options || [],
          added,
          removed,
        },
      });
    } else {
      // Original behavior for other field types (text, number, date, etc.)
      activities.push({
        activityType: 'property.field_changed',
        target: activityTarget,
        action: {
          type: kind,
          description:
            kind === 'set'
              ? `set ${fieldDef.name}`
              : kind === 'unset'
              ? `cleared ${fieldDef.name}`
              : `changed ${fieldDef.name}`,
        },
        changes: {
          fieldId,
          fieldName: fieldDef.name,
          fieldType: fieldDef.type,
          fieldOptions: fieldDef.options || [],
          prev,
          current,
        },
      });
    }
  }

  return activities;
}

export async function activityBuilder<TResult = any>(
  prevDocument: any,
  currentDocument: any,
  config: Config<TResult>,
  ctx: any,
): Promise<TResult[]> {
  const prevSnapshot = getSnapshot(prevDocument);
  const currentSnapshot = getSnapshot(currentDocument);

  const changes = normalizeDiffs(prevSnapshot, currentSnapshot);

  const {
    assignmentFields = [],
    commonFields = [],
    resolvers = {},
  } = config || {};
  const activityTarget = resolveActivityTarget(currentDocument, config, ctx);

  const activities: TResult[] = [];
  for (const change of changes) {
    const { field, prev, current, kind } = change;

    const resolver = findResolver(field, resolvers);
    if (!resolver) {
      continue;
    }

    if (kind === 'array' && assignmentFields.includes(field)) {
      const { added, removed } = detectAssignmentDelta(prev, current);

      if (!added.length && !removed.length) {
        continue;
      }

      const result = await resolver(
        { field, added, removed },
        { ...ctx, target: currentDocument, activityTarget },
      );

      if (Array.isArray(result) && result.length) {
        activities.push(...result);
      }

      continue;
    }

    const isCommonField = commonFields.some((pattern) =>
      matchesFieldPattern(pattern, field),
    );

    if (!isCommonField) {
      continue;
    }

    const result = await resolver({ field, prev, current }, ctx);

    if (Array.isArray(result) && result.length) {
      activities.push(...result);
    }
  }

  // Built-in: automatically handle propertiesData.* changes
  const propActivities = await buildPropertiesDataActivities(changes, {
    ...ctx,
    activityTarget,
  });
  if (propActivities.length) {
    activities.push(...(propActivities as TResult[]));
  }

  return activities;
}
