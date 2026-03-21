import { normalizeDiffs } from '../activityLogUtils';
import { Config } from './types';
import {
  detectAssignmentDelta,
  findResolver,
  matchesFieldPattern,
  getSnapshot,
} from './utils';

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

      const result = await resolver({ field, added, removed }, ctx);

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

  return activities;
}
