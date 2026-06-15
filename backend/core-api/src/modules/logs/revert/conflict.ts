import { get as lodashGet, isEqual } from 'lodash';
import { RevertableLogEntry } from './computeInverse';
import { FieldConflict } from './types';

/**
 * Optimistic conflict detection for point-in-time revert.
 *
 * A revert is safe only if nothing changed the doc between the forward write we
 * are undoing and now. We compare the LIVE doc against the recorded after-image
 * (what the forward op produced) over EXACTLY the fields the forward op touched.
 * If a touched field's live value diverges from the recorded after-image value,
 * the field is in conflict: an intervening change would be silently clobbered by
 * a blind restore.
 *
 * Returns one FieldConflict per diverged field:
 *   - revertValue  = the value the revert would restore (recorded prev)
 *   - currentValue = the intervening live value
 *
 * No DB access — the caller supplies the live doc.
 */

// Bookkeeping / derived fields that change as a side effect of every write and
// carry no user intent. They must NOT be reported as conflicts: a merge UI would
// ask the user to reconcile `updatedAt` (which always differs), and because they
// differ on essentially every intervening write, including them would make nearly
// every update-revert look conflicted. The revert's inverse still restores them;
// we only suppress them from the human-facing conflict surface. Matching is on
// the field's root segment so nested paths under these are covered too.
const VOLATILE_FIELD_ROOTS = new Set<string>([
  'updatedAt',
  'modifiedAt',
  'createdAt',
  '__v',
  'searchText',
]);

/** True when a path's root segment is a volatile/bookkeeping field. */
const isVolatilePath = (path: string): boolean =>
  VOLATILE_FIELD_ROOTS.has(path) ||
  VOLATILE_FIELD_ROOTS.has(path.split('.')[0]);

/** True for a non-null, non-array, non-Date plain object. */
const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  v !== null &&
  typeof v === 'object' &&
  !Array.isArray(v) &&
  !(v instanceof Date);

/** True when a node is a `{ prev, current }` diff leaf (exactly those two keys). */
const isDiffLeaf = (v: unknown): v is { prev: unknown; current: unknown } =>
  isPlainObject(v) &&
  Object.prototype.hasOwnProperty.call(v, 'prev') &&
  Object.prototype.hasOwnProperty.call(v, 'current') &&
  Object.keys(v).length === 2;

interface FlatLeaf {
  path: string;
  prev: unknown;
  current: unknown;
}

/** Flatten an updated/removed/added accumulator into dot-path leaves. */
function flattenUpdated(node: unknown, prefix: string, out: FlatLeaf[]): void {
  if (isDiffLeaf(node)) {
    out.push({ path: prefix, prev: node.prev, current: node.current });
    return;
  }
  if (isPlainObject(node)) {
    for (const key of Object.keys(node)) {
      const path = prefix ? `${prefix}.${key}` : key;
      flattenUpdated(node[key], path, out);
    }
  }
}

/** Flatten an added/removed accumulator into dot-path leaf values. */
function flattenLeafValues(
  node: unknown,
  prefix: string,
  out: Array<{ path: string; value: unknown }>,
): void {
  if (!isPlainObject(node)) {
    if (prefix) {
      out.push({ path: prefix, value: node });
    }
    return;
  }
  for (const key of Object.keys(node)) {
    const path = prefix ? `${prefix}.${key}` : key;
    flattenLeafValues(node[key], path, out);
  }
}

const FIELD_ABSENT = Symbol('absent');

/**
 * Detect field-level conflicts between an update log entry and the live doc.
 * Only meaningful for `update` entries; create/delete inverses use the
 * whole-doc conflict checks in applyWrite (live-must-match / live-must-be-absent).
 */
export function detectUpdateConflicts(
  entry: RevertableLogEntry,
  liveDoc: Record<string, unknown> | null,
): FieldConflict[] {
  if (entry.action !== 'update') {
    return [];
  }

  const diff = entry.payload?.updateDescription || {};
  const conflicts: FieldConflict[] = [];

  // updated: forward op changed prev -> current. Conflict if live !== current.
  const updatedLeaves: FlatLeaf[] = [];
  if (diff.updated) {
    flattenUpdated(diff.updated, '', updatedLeaves);
  }
  for (const leaf of updatedLeaves) {
    if (isVolatilePath(leaf.path)) {
      continue;
    }
    const liveValue = liveDoc
      ? lodashGet(liveDoc, leaf.path, FIELD_ABSENT)
      : FIELD_ABSENT;
    if (liveValue === FIELD_ABSENT || !isEqual(liveValue, leaf.current)) {
      conflicts.push({
        field: leaf.path,
        revertValue: leaf.prev,
        currentValue: liveValue === FIELD_ABSENT ? undefined : liveValue,
      });
    }
  }

  // added: forward op added a field (after-image has it, prev did not). The
  // revert unsets it; conflict if the live value diverged from what was added.
  if (diff.added) {
    const addedLeaves: Array<{ path: string; value: unknown }> = [];
    flattenLeafValues(diff.added, '', addedLeaves);
    for (const leaf of addedLeaves) {
      if (isVolatilePath(leaf.path)) {
        continue;
      }
      const liveValue = liveDoc
        ? lodashGet(liveDoc, leaf.path, FIELD_ABSENT)
        : FIELD_ABSENT;
      if (liveValue !== FIELD_ABSENT && !isEqual(liveValue, leaf.value)) {
        conflicts.push({
          field: leaf.path,
          // Revert removes the field — express "restore to absent" as undefined.
          revertValue: undefined,
          currentValue: liveValue,
        });
      }
    }
  }

  // removed: forward op removed a field that previously held `value`. The revert
  // restores it; conflict if the live doc now holds a DIFFERENT value at that
  // path (something re-added it differently).
  if (diff.removed) {
    const removedLeaves: Array<{ path: string; value: unknown }> = [];
    flattenLeafValues(diff.removed, '', removedLeaves);
    for (const leaf of removedLeaves) {
      if (isVolatilePath(leaf.path)) {
        continue;
      }
      const liveValue = liveDoc
        ? lodashGet(liveDoc, leaf.path, FIELD_ABSENT)
        : FIELD_ABSENT;
      if (liveValue !== FIELD_ABSENT && !isEqual(liveValue, leaf.value)) {
        conflicts.push({
          field: leaf.path,
          revertValue: leaf.value,
          currentValue: liveValue,
        });
      }
    }
  }

  return conflicts;
}
