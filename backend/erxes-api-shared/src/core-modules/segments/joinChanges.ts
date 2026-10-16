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

// The records a change touched, as they were and as they are.
export type SegmentTouched = { prev?: unknown[]; current?: unknown[] };

const valuesAt = (documents: unknown[] | undefined, path: string) => {
  const values = (documents || []).flatMap((doc) => {
    const value = at(doc, path);
    return value === undefined ? [] : [value].flat();
  });

  return values.length ? values : undefined;
};

export const segmentJoinChanges = async (
  contentType: string,
  diff: SegmentDiff | undefined,
  touched: SegmentTouched = {},
): Promise<SegmentJoinChanges | undefined> => {
  if (!diff && !touched.prev?.length && !touched.current?.length) {
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
    const updated = at(diff?.updated, path);
    const both = isBothSides(updated);

    // A record reaches whoever it points at, whether or not that field moved;
    // the diff only stands in where no document was at hand.
    const prev =
      valuesAt(touched.prev, path) ??
      (both ? updated.prev : at(diff?.removed, path));
    const next =
      valuesAt(touched.current, path) ??
      (both ? updated.current : at(diff?.added, path));

    if (prev !== undefined || next !== undefined) {
      changes[path] = { prev, next };
    }
  }

  return Object.keys(changes).length ? changes : undefined;
};
