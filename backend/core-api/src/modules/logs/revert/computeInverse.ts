/**
 * The pure heart of point-in-time revert: given one event-log entry, compute the
 * inverse operation that undoes it. No DB access — callers read the current doc
 * and apply the returned op. Keeping this pure makes the safety-critical logic
 * exhaustively testable.
 *
 * Inverses (see getDiffObjects for the diff shape stored on updates):
 *   create            -> delete the created doc
 *   delete/deleteMany -> re-insert the snapshot, preserving its original _id
 *   update            -> $set changed fields back to prev, restore removed
 *                        fields, unset added fields
 *   updateMany/bulkWrite -> NOT auto-reverted (the aggregate diff lacks reliable
 *                        per-doc prev state); flagged for manual review instead
 *                        of risking a wrong write.
 */

export interface RevertableLogEntry {
  _id?: string;
  action:
    | 'create'
    | 'update'
    | 'delete'
    | 'deleteMany'
    | 'updateMany'
    | 'bulkWrite';
  docId?: string;
  contentType?: string;
  payload?: {
    collectionName?: string;
    collectionType?: string;
    fullDocument?: Record<string, unknown> | null;
    prevDocument?: Record<string, unknown> | null;
    updateDescription?: {
      added?: Record<string, unknown>;
      removed?: Record<string, unknown>;
      updated?: Record<string, unknown>;
    };
  };
}

export type InverseOp =
  | {
      kind: 'insert';
      contentType?: string;
      docId: string;
      document: Record<string, unknown>;
    }
  | { kind: 'delete'; contentType?: string; docId: string }
  | {
      kind: 'update';
      contentType?: string;
      docId: string;
      set: Record<string, unknown>;
      unset: string[];
    }
  | { kind: 'skip'; reason: string };

/** True for a non-null, non-array, non-Date plain object. */
const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  v !== null &&
  typeof v === 'object' &&
  !Array.isArray(v) &&
  !(v instanceof Date);

/** A node is a diff leaf when it is exactly a { prev, current } pair. */
const isDiffLeaf = (v: unknown): v is { prev: unknown; current: unknown } =>
  isPlainObject(v) &&
  Object.prototype.hasOwnProperty.call(v, 'prev') &&
  Object.prototype.hasOwnProperty.call(v, 'current') &&
  Object.keys(v).length === 2;

/**
 * Flatten a diff accumulator (added/removed/updated) into dot-path → value.
 * `pick` extracts the value to emit at each leaf; recursion descends only
 * through plain non-leaf objects, so nested field paths are preserved exactly
 * as MongoDB $set/$unset expect them.
 */
function flattenLeaves(
  node: unknown,
  pick: (leaf: unknown) => unknown,
  isLeaf: (v: unknown) => boolean,
  prefix = '',
  out: Record<string, unknown> = {},
): Record<string, unknown> {
  if (isLeaf(node)) {
    out[prefix] = pick(node);
    return out;
  }
  if (isPlainObject(node)) {
    for (const key of Object.keys(node)) {
      const path = prefix ? `${prefix}.${key}` : key;
      flattenLeaves(node[key], pick, isLeaf, path, out);
    }
    return out;
  }
  // A bare primitive/array/Date at the top with no key — nothing addressable.
  return out;
}

/** Compute the inverse of one log entry. Never throws; returns a skip on doubt. */
export function computeInverse(entry: RevertableLogEntry): InverseOp {
  const { action, contentType } = entry;
  const payload = entry.payload || {};
  const docId = entry.docId;

  if (action === 'create') {
    if (!docId) return { kind: 'skip', reason: 'create log has no docId' };
    // Undo a creation by deleting the doc.
    return { kind: 'delete', contentType, docId };
  }

  if (action === 'delete' || action === 'deleteMany') {
    if (!docId) return { kind: 'skip', reason: 'delete log has no docId' };
    const snapshot = payload.prevDocument;
    if (!isPlainObject(snapshot)) {
      return {
        kind: 'skip',
        reason: 'delete has no prevDocument snapshot (pre-snapshot deletion)',
      };
    }
    // Re-insert exactly as it was, preserving the original _id so references
    // pointing at this doc are made whole again.
    return {
      kind: 'insert',
      contentType,
      docId,
      document: { ...snapshot, _id: snapshot._id ?? docId },
    };
  }

  if (action === 'update') {
    if (!docId) return { kind: 'skip', reason: 'update log has no docId' };
    const diff = payload.updateDescription || {};

    const set: Record<string, unknown> = {};
    const unset: string[] = [];

    // updated: restore each changed leaf to its prev value.
    if (diff.updated) {
      flattenLeaves(
        diff.updated,
        (leaf) => (leaf as { prev: unknown }).prev,
        isDiffLeaf,
        '',
        set,
      );
    }

    // removed: the field existed before with this value — set it back.
    if (diff.removed) {
      flattenLeaves(
        diff.removed,
        (leaf) => leaf,
        (v) => !isPlainObject(v),
        '',
        set,
      );
    }

    // added: the field did not exist before — unset it.
    if (diff.added) {
      const addedPaths = flattenLeaves(
        diff.added,
        () => true,
        (v) => !isPlainObject(v),
        '',
        {},
      );
      unset.push(...Object.keys(addedPaths));
    }

    if (Object.keys(set).length === 0 && unset.length === 0) {
      return { kind: 'skip', reason: 'update diff is empty' };
    }
    return { kind: 'update', contentType, docId, set, unset };
  }

  // updateMany / bulkWrite: the diff is an aggregate, not per-doc prev state.
  return {
    kind: 'skip',
    reason: `${action} is not auto-revertible (no reliable per-document prior state)`,
  };
}
