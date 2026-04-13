import { sendTRPCMessage } from '../../../utils/trpc';
import { normalizeDiffs } from '../activityLogUtils';
import { Config } from './types';
import {
  detectAssignmentDelta,
  findResolver,
  getSnapshot,
  logActivityLogError,
  matchesFieldPattern,
} from './utils';

const PROPERTIES_DATA_PREFIX = 'propertiesData.';

function resolveActivityTarget(document: any, config: Config, ctx: any) {
  try {
    if (typeof config?.buildTarget === 'function') {
      return config.buildTarget(document, ctx);
    }
  } catch (error) {
    logActivityLogError('resolveActivityTarget', error, {
      subdomain: ctx?.subdomain,
      targetId: document?._id,
    });
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
  try {
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

      const isMultiSelectOrCheckbox = ['multiselect', 'checkbox'].includes(
        fieldDef.type?.toLowerCase(),
      );

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
  } catch (error) {
    logActivityLogError('buildPropertiesDataActivities', error, {
      subdomain: ctx?.subdomain,
      targetId: ctx?.activityTarget?._id ?? ctx?.target?._id,
    });
    return [];
  }
}

export async function activityBuilder<TResult = any>(
  prevDocument: any,
  currentDocument: any,
  config: Config<TResult>,
  ctx: any,
): Promise<TResult[]> {
  const activities: TResult[] = [];
  let changes: ReturnType<typeof normalizeDiffs> = [];
  let assignmentFields: string[] = [];
  let commonFields: string[] = [];
  let resolvers: Record<string, any> = {};

  try {
    const prevSnapshot = getSnapshot(prevDocument);
    const currentSnapshot = getSnapshot(currentDocument);

    changes = normalizeDiffs(prevSnapshot, currentSnapshot);

    ({
      assignmentFields = [],
      commonFields = [],
      resolvers = {},
    } = config || {});
  } catch (error) {
    logActivityLogError('activityBuilder setup', error, {
      subdomain: ctx?.subdomain,
      targetId: currentDocument?._id ?? prevDocument?._id,
    });
    return activities;
  }

  const activityTarget = resolveActivityTarget(currentDocument, config, ctx);

  for (const change of changes) {
    const { field, prev, current, kind } = change;

    try {
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
    } catch (error) {
      logActivityLogError('activityBuilder change', error, {
        field,
        subdomain: ctx?.subdomain,
        targetId: activityTarget?._id ?? currentDocument?._id,
      });
    }
  }

  const propActivities = await buildPropertiesDataActivities(changes, {
    ...ctx,
    activityTarget,
  });
  if (propActivities.length) {
    activities.push(...(propActivities as TResult[]));
  }

  return activities;
}
