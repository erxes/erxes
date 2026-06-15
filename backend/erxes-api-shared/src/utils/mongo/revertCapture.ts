import { Schema } from 'mongoose';
import { sendWorkerQueue } from '../mq-worker';
import { getEventHandlerRuntimeContext } from '../../core-modules/common/eventHandlers/runtimeContext';
import { getDiffObjects } from '../utils';

/**
 * Dynamic, zero-per-call-site capture for point-in-time revert.
 *
 * Installed once into the shared `schemaWrapper` (which every model schema runs
 * through), so EVERY collection — current or future, any plugin/connection — has
 * its destructive writes journaled automatically, with no per-model code. The
 * journal entries are the SAME shape the manual `sendDbEventLog` emits, so the
 * existing revert engine consumes them unchanged.
 *
 * Scope: DELETES (deleteOne / deleteMany / findOneAndDelete) and EDITS
 * (updateOne / updateMany / findOneAndUpdate). A `pre` hook snapshots the matching
 * documents before the write; a `post` hook journals only after it succeeds —
 * deletes carry the prior snapshot (to re-insert), edits carry the per-document
 * before→after diff (to restore prior field values). Creates are intentionally
 * NOT captured: reverting a new record is just deleting it.
 *
 * Safety: the whole thing is gated behind REVERT_AUTO_JOURNAL=enable (a complete
 * no-op otherwise, so the 124 schemas are untouched when disabled), and every
 * hook is wrapped so a capture failure can NEVER block or throw out of the write.
 */

const AUTO_JOURNAL_ENABLED = process.env.REVERT_AUTO_JOURNAL === 'enable';

// Bound the extra read a bulk delete triggers. Beyond this many matches we keep
// the ids but skip the snapshot (still audited; the overflow is not auto-revertable).
const MAX_SNAPSHOT = Number(process.env.REVERT_AUTO_JOURNAL_MAX || 1000);

// Stash keys carried from a `pre` hook to its `post` hook on the same instance.
const SNAP = Symbol('revertCaptureSnapshot');
const SNAP_SAVE = Symbol('revertCaptureSaveSnapshot');
const WAS_NEW = Symbol('revertCaptureWasNew');

/** A lean, awaitable Mongoose array query — only the bits these hooks chain. */
type LeanArrayQuery = PromiseLike<Array<Record<string, unknown>>> & {
  limit: (n: number) => LeanArrayQuery;
  lean: () => LeanArrayQuery;
};

/** A lean, awaitable single-document Mongoose query. */
type LeanDocQuery = PromiseLike<Record<string, unknown> | null> & {
  lean: () => LeanDocQuery;
};

/** The subset of a Mongoose model the capture hooks read/use. */
type CaptureModel = {
  modelName?: string;
  collection?: { name?: string };
  db?: { name?: string };
  find: (filter: unknown) => LeanArrayQuery;
  findById: (id: unknown) => LeanDocQuery;
};

/** `this` inside the query-level delete/update middleware. */
type QueryHookThis = {
  model: CaptureModel;
  getFilter?: () => Record<string, unknown>;
  [stash: symbol]: Array<Record<string, unknown>> | undefined;
};

/** `this` inside the document-level `save` middleware. */
type SaveHookThis = {
  isNew: boolean;
  _id: unknown;
  toObject?: () => Record<string, unknown>;
  [SNAP_SAVE]?: Record<string, unknown> | null;
  [WAS_NEW]?: boolean;
};

/** The (library-resolved) document type `getDiffObjects` expects. */
type DiffDoc = Parameters<typeof getDiffObjects>[1];

/** Coerce a Mongoose id (ObjectId, string, …) to its string form. */
const toIdString = (v: unknown): string => {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  return String(v);
};

/**
 * Optional map from a collection name to its revert contentType
 * (`plugin:module.collection`). The host service seeds this from its meta/logs so
 * auto-captured entries reuse the existing contentType registry (permission +
 * model resolution). When unresolved, a fallback contentType is recorded and the
 * entry is still revertable by its mongooseName downstream.
 */
let contentTypeResolver:
  | ((collectionName: string) => string | undefined)
  | undefined;

/** Register the host service's collection-name → contentType resolver. */
export const registerRevertContentTypeResolver = (
  fn: (collectionName: string) => string | undefined,
): void => {
  contentTypeResolver = fn;
};

/** Enqueue a `put_log` journal entry; best-effort, never throws into the write. */
const emitPutLog = (payload: Record<string, unknown>): void => {
  try {
    sendWorkerQueue('logs', 'put_log')
      .add('put_log', payload, { removeOnComplete: true })
      .catch(() => {
        /* best-effort journal; never surface to the write path */
      });
  } catch {
    /* never break a write because journaling failed */
  }
};

type DeleteKind = 'delete' | 'deleteMany';

/**
 * Resolve the runtime context + model identity shared by every journal entry:
 * the collection/mongoose/db names, the (possibly auto-derived) contentType, and
 * the common `base` payload markers the revert engine keys off.
 */
const buildJournalBase = (model: CaptureModel) => {
  let ctx;
  try {
    ctx = getEventHandlerRuntimeContext();
  } catch {
    ctx = undefined;
  }

  const collectionName: string =
    model?.collection?.name || model?.modelName || '';
  const mongooseName: string = model?.modelName || '';
  let dbName = '';
  try {
    dbName = model?.db?.name || '';
  } catch {
    dbName = '';
  }

  const contentType =
    contentTypeResolver?.(collectionName) ||
    `auto:${collectionName}.${collectionName}`;

  const base = {
    subdomain: ctx?.subdomain || '',
    source: 'mongo',
    status: 'success',
    contentType,
    processId: ctx?.processId || '',
    userId: ctx?.userId || '',
    // Markers for the (dynamic) revert path: resolve the model generically even
    // when no meta/logs contentType is configured for this collection.
    autoJournal: true,
    mongooseName,
    dbName,
  };

  return { collectionName, mongooseName, dbName, base };
};

/** Journal a delete/deleteMany as revertable entries carrying the prior snapshot. */
const journalDeletes = (
  model: CaptureModel,
  docs: Array<Record<string, unknown>>,
  kind: DeleteKind,
): void => {
  try {
    if (!docs || !docs.length) return;

    const { collectionName, mongooseName, dbName, base } =
      buildJournalBase(model);

    if (kind === 'deleteMany') {
      emitPutLog({
        ...base,
        action: 'deleteMany',
        docIds: docs.map((d) => toIdString(d._id)),
        payload: { collectionName, prevDocuments: docs, mongooseName, dbName },
      });
    } else {
      const doc = docs[0];
      emitPutLog({
        ...base,
        action: 'delete',
        docId: toIdString(doc._id),
        payload: {
          collectionName,
          docId: toIdString(doc._id),
          prevDocument: doc,
          mongooseName,
          dbName,
        },
      });
    }
  } catch {
    /* capture is best-effort and must never disturb the write */
  }
};

/** Build a `pre` delete hook that snapshots the matching docs before the write. */
const makePreHook = (kind: DeleteKind) => {
  return async function (this: QueryHookThis) {
    try {
      const filter =
        typeof this.getFilter === 'function' ? this.getFilter() : {};
      const query = this.model.find(filter).lean();
      if (kind === 'delete') {
        query.limit(1);
      } else {
        query.limit(MAX_SNAPSHOT);
      }
      this[SNAP] = await query;
    } catch {
      this[SNAP] = undefined;
    }
  };
};

/** Build a `post` delete hook that journals the snapshot once the write succeeds. */
const makePostHook = (kind: DeleteKind) => {
  return function (this: QueryHookThis) {
    try {
      const docs = this[SNAP];
      if (docs?.length) {
        journalDeletes(this.model, docs, kind);
      }
    } catch {
      /* never disturb the write path */
    }
  };
};

/** True when an update diff actually adds, removes, or changes any field. */
const hasChanges = (ud: {
  added?: Record<string, unknown>;
  removed?: Record<string, unknown>;
  updated?: Record<string, unknown>;
}): boolean =>
  Boolean(ud) &&
  (Object.keys(ud.added || {}).length > 0 ||
    Object.keys(ud.removed || {}).length > 0 ||
    Object.keys(ud.updated || {}).length > 0);

/**
 * Journal one `update` event per changed document, carrying the before→after
 * diff (updateDescription) the revert engine inverts. A bulk updateMany thus
 * becomes N per-document revertable updates rather than one un-revertable
 * aggregate. No-op for documents whose content did not actually change.
 */
const journalUpdates = (
  model: CaptureModel,
  beforeDocs: Array<Record<string, unknown>>,
  afterById: Map<string, Record<string, unknown>>,
): void => {
  try {
    if (!beforeDocs || !beforeDocs.length) return;

    const { collectionName, mongooseName, dbName, base } =
      buildJournalBase(model);

    for (const before of beforeDocs) {
      const id = toIdString(before._id);
      const after = afterById.get(id);
      if (!after) continue;

      const updateDescription = getDiffObjects(
        before as unknown as DiffDoc,
        after as unknown as DiffDoc,
      );
      if (!hasChanges(updateDescription)) continue;

      emitPutLog({
        ...base,
        action: 'update',
        docId: id,
        payload: { collectionName, updateDescription, mongooseName, dbName },
      });
    }
  } catch {
    /* capture is best-effort and must never disturb the write */
  }
};

/** Build a `pre` update hook that snapshots the to-be-updated docs. */
const makeUpdatePreHook = () => {
  return async function (this: QueryHookThis) {
    try {
      const filter =
        typeof this.getFilter === 'function' ? this.getFilter() : {};
      this[SNAP] = await this.model.find(filter).limit(MAX_SNAPSHOT).lean();
    } catch {
      this[SNAP] = undefined;
    }
  };
};

/** Build a `post` update hook that diffs before→after and journals per-doc edits. */
const makeUpdatePostHook = () => {
  return async function (this: QueryHookThis) {
    try {
      const before = this[SNAP];
      if (!before?.length) return;
      const ids = before.map((d) => d._id);
      const after = (await this.model
        .find({ _id: { $in: ids } })
        .lean()) as Array<Record<string, unknown>>;
      const afterById = new Map<string, Record<string, unknown>>(
        after.map((d) => [toIdString(d._id), d]),
      );
      journalUpdates(this.model, before, afterById);
    } catch {
      /* never disturb the write path */
    }
  };
};

// Document middleware for `doc.save()` edits (a common erxes update path that
// query middleware does NOT see). Creates (isNew) are skipped on purpose.

/** `pre('save')`: remember whether this was a create, and snapshot the prior doc. */
const savePreHook = async function (this: SaveHookThis) {
  try {
    this[WAS_NEW] = Boolean(this.isNew);
    this[SNAP_SAVE] = undefined;
    if (this.isNew) return;
    this[SNAP_SAVE] = await (this.constructor as unknown as CaptureModel)
      .findById(this._id)
      .lean();
  } catch {
    this[SNAP_SAVE] = undefined;
  }
};

/** `post('save')`: for an edit (not a create), journal the before→after diff. */
const savePostHook = function (this: SaveHookThis) {
  try {
    if (this[WAS_NEW]) return;
    const before = this[SNAP_SAVE];
    if (!before) return;
    const after =
      typeof this.toObject === 'function'
        ? this.toObject()
        : (this as unknown as Record<string, unknown>);
    journalUpdates(
      this.constructor as unknown as CaptureModel,
      [before],
      new Map([[toIdString(before._id), after]]),
    );
  } catch {
    /* never disturb the write path */
  }
};

/**
 * Install the delete-capture hooks on a schema. Called from `schemaWrapper`, so
 * every wrapped schema gets them. No-op unless REVERT_AUTO_JOURNAL=enable.
 */
export const installRevertCaptureHooks = (schema: Schema): void => {
  if (!AUTO_JOURNAL_ENABLED) {
    return;
  }

  // Query-level middleware (Model.deleteMany / Model.deleteOne / findOneAndDelete).
  schema.pre('deleteMany', makePreHook('deleteMany'));
  schema.post('deleteMany', makePostHook('deleteMany'));

  schema.pre(
    'deleteOne',
    { query: true, document: false },
    makePreHook('delete'),
  );
  schema.post(
    'deleteOne',
    { query: true, document: false },
    makePostHook('delete'),
  );

  schema.pre('findOneAndDelete', makePreHook('delete'));
  schema.post('findOneAndDelete', makePostHook('delete'));

  // Edit capture (Model.updateMany / Model.updateOne / findOneAndUpdate). Each
  // produces one revertable per-document update carrying the before→after diff.
  schema.pre('updateMany', makeUpdatePreHook());
  schema.post('updateMany', makeUpdatePostHook());

  schema.pre(
    'updateOne',
    { query: true, document: false },
    makeUpdatePreHook(),
  );
  schema.post(
    'updateOne',
    { query: true, document: false },
    makeUpdatePostHook(),
  );

  schema.pre('findOneAndUpdate', makeUpdatePreHook());
  schema.post('findOneAndUpdate', makeUpdatePostHook());

  // Document-level edit via doc.save().
  schema.pre('save', savePreHook);
  schema.post('save', savePostHook);
};
