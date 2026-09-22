import { gatherSegmentJoinPaths } from './relationRegistry';

export type SegmentJoinChanges = Record<
  string,
  { prev?: unknown; next?: unknown }
>;

export type SegmentDiff = {
  added?: Record<string, unknown>;
  removed?: Record<string, unknown>;
  updated?: Record<string, unknown>;
};

const at = (source: unknown, path: string): unknown =>
  path
    .split('.')
    .reduce<unknown>(
      (current, segment) =>
        current && typeof current === 'object'
          ? (current as Record<string, unknown>)[segment]
          : undefined,
      source,
    );

const isBothSides = (
  value: unknown,
): value is { prev?: unknown; current?: unknown } =>
  Boolean(value) &&
  typeof value === 'object' &&
  ('prev' in (value as object) || 'current' in (value as object));

export const segmentJoinChanges = async (
  contentType: string,
  diff: SegmentDiff | undefined,
): Promise<SegmentJoinChanges | undefined> => {
  if (!diff) {
    return undefined;
  }

  let paths: string[];

  try {
    paths = (await gatherSegmentJoinPaths()).get(contentType) || [];
  } catch {
    return undefined;
  }

  const changes: SegmentJoinChanges = {};

  for (const path of paths) {
    const updated = at(diff.updated, path);

    if (isBothSides(updated)) {
      changes[path] = { prev: updated.prev, next: updated.current };
      continue;
    }

    const added = at(diff.added, path);
    const removed = at(diff.removed, path);

    if (added !== undefined || removed !== undefined) {
      changes[path] = { prev: removed, next: added };
    }
  }

  return Object.keys(changes).length ? changes : undefined;
};
