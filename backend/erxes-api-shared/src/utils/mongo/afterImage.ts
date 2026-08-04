/**
 * Pure helpers for the point-in-time revert capture's in-memory after-image.
 *
 * These functions contain NO mongoose runtime dependency, so they are unit
 * testable in isolation (see afterImage.test.ts). They power the efficiency
 * refactor that eliminates the post-update re-read for the common
 * $set / $unset / replacement-style update path.
 *
 * The classifier is intentionally conservative: an update is "simple" (its
 * after-image can be computed in memory from before + operators) ONLY when
 * every effect is a literal $set / $unset / shorthand-field assignment with no
 * positional/array semantics. Anything whose result depends on the server's
 * prior document state or clock ($inc, $push, $pull, positional `$`, aggregation
 * pipelines, …) is "complex" and MUST fall back to a real re-read — we never
 * guess an after-image.
 */

import * as _loadash from 'lodash';

/** A Mongoose query update: an operator object, a replacement doc, or a pipeline. */
export type UpdateExpr =
  | Record<string, unknown>
  | Array<Record<string, unknown>>
  | null
  | undefined;

/**
 * Operators that REQUIRE the server-side prior document/array state (or clock)
 * to resolve, so their after-image cannot be safely synthesized in memory.
 * Presence of any of these forces the post re-read fallback. This is the
 * authoritative fallback list referenced by the docs.
 */
export const COMPLEX_UPDATE_OPERATORS: ReadonlySet<string> = new Set([
  '$inc',
  '$mul',
  '$min',
  '$max',
  '$rename',
  '$currentDate',
  '$bit',
  '$push',
  '$pull',
  '$pullAll',
  '$pop',
  '$addToSet',
]);

/**
 * Operators that NEVER affect the after-image of an EXISTING document, so they
 * are ignored — neither forcing the re-read fallback nor being replayed.
 * `$setOnInsert` only takes effect when an upsert INSERTS a new doc, and we never
 * journal creates (only updates to existing docs), so it is irrelevant to every
 * diff we capture. Critically, Mongoose auto-injects `$setOnInsert: { createdAt }`
 * into EVERY update on a `timestamps: true` schema (the erxes-wide default) before
 * our pre-hook runs, so NOT ignoring it would push virtually every real update
 * onto the slow full-doc re-read path — defeating the whole optimization.
 */
const IGNORABLE_UPDATE_OPERATORS: ReadonlySet<string> = new Set(['$setOnInsert']);

/** The only top-level operators we can replay in memory. */
const SIMPLE_UPDATE_OPERATORS: ReadonlySet<string> = new Set(['$set', '$unset']);

/**
 * A path is "positional" (depends on matched array element state) when it
 * contains a `$` positional token: `a.$`, `a.$[]`, `a.$[elem]`. Such paths
 * cannot be replayed in memory.
 */
const hasPositional = (path: string): boolean =>
  path.includes('$') && /(^|\.)\$(\[|\.|$)/.test(path);

/** True when the update is an aggregation pipeline (array form). */
export const isPipelineUpdate = (update: UpdateExpr): boolean =>
  Array.isArray(update);

/**
 * True when the update is a no-operator object (every top-level key is a plain
 * field, not a `$`-operator). For the hooked query ops (updateOne / updateMany /
 * findOneAndUpdate) Mongoose treats this as SHORTHAND `$set` of those fields (it
 * does NOT drop unmentioned fields), so it is computable in memory. (A true
 * whole-doc overwrite only happens via `replaceOne`/`findOneAndReplace`, which we
 * do not hook.)
 */
export const isReplacementUpdate = (update: UpdateExpr): boolean => {
  if (!update || Array.isArray(update)) return false;
  const keys = Object.keys(update);
  if (keys.length === 0) return false;
  return keys.every((k) => !k.startsWith('$'));
};

/** True when any target path of a `$set`/`$unset` payload is positional. */
const hasPositionalPaths = (inner: unknown): boolean => {
  if (!inner || typeof inner !== 'object' || Array.isArray(inner)) return false;
  return Object.keys(inner).some(hasPositional);
};

/**
 * Classify a single top-level update entry (key + value): `true` forces the
 * complex post-read fallback, `false` means it is replayable in memory.
 */
const isComplexEntry = (key: string, value: unknown): boolean => {
  // Shorthand top-level field (implicit $set) — complex only if positional.
  if (!key.startsWith('$')) return hasPositional(key);
  // Insert-only injected operator ($setOnInsert) → no effect on an existing doc.
  if (IGNORABLE_UPDATE_OPERATORS.has(key)) return false;
  // Known complex operator, or any operator we do not explicitly replay.
  if (COMPLEX_UPDATE_OPERATORS.has(key)) return true;
  if (!SIMPLE_UPDATE_OPERATORS.has(key)) return true;
  // $set / $unset: complex only if a target path is positional.
  return hasPositionalPaths(value);
};

/**
 * Classify an update: `true` => complex => MUST fall back to the post re-read;
 * `false` => simple => its after-image can be computed in memory via
 * `applyUpdateOperators`.
 *
 * @param update     The value of `query.getUpdate()` (raw in pre, normalized in
 *                   post — both shapes handled).
 * @param hasArrayFilters Whether the query options carry `arrayFilters`
 *                   (positional element targeting → always complex).
 */
export const isComplexUpdate = (
  update: UpdateExpr,
  hasArrayFilters = false,
): boolean => {
  if (Array.isArray(update)) return true; // aggregation pipeline: not replayable
  if (!update) return true; // nothing classifiable → treat as complex
  if (hasArrayFilters) return true;
  return Object.keys(update).some((key) => isComplexEntry(key, update[key]));
};

/**
 * Extract the set of field paths an update touches (for projecting the
 * pre-read). Returns dotted paths from $set/$unset keys and shorthand top-level
 * fields, plus the target paths of complex operators (so a fallback re-read can
 * still be projected when callers choose to). `_id` is always implicitly
 * included by Mongo, callers add it to the projection explicitly.
 */
export const extractTouchedPaths = (update: UpdateExpr): string[] => {
  if (!update || Array.isArray(update)) return [];
  const paths = new Set<string>();
  for (const key of Object.keys(update)) {
    collectTouchedPaths(key, update[key], paths);
  }
  return Array.from(paths).filter((p) => p.length > 0);
};

/** Add the projection path(s) a single update entry touches into `paths`. */
const collectTouchedPaths = (
  key: string,
  value: unknown,
  paths: Set<string>,
): void => {
  if (!key.startsWith('$')) {
    // Shorthand field (implicit $set).
    paths.add(rootArrayPath(key));
    return;
  }
  // Insert-only operators never change an existing doc → not a touched path.
  if (IGNORABLE_UPDATE_OPERATORS.has(key)) return;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return;
  // Strip a positional/array suffix to the root field the projection selects.
  for (const path of Object.keys(value)) {
    paths.add(rootArrayPath(path));
  }
};

/**
 * Reduce a possibly-positional path to the field a projection can select.
 * `a.$.b` / `a.$[].b` / `a.$[x].b` → `a`; `a.b` stays `a.b`.
 */
const rootArrayPath = (path: string): string => {
  const idx = path.search(/(^|\.)\$/);
  if (idx === -1) return path;
  // Keep the segment(s) before the positional token.
  const head = path.slice(0, idx);
  return head.replace(/\.$/, '');
};

/**
 * Compute the in-memory after-image of a SIMPLE update applied to `before`.
 * Returns `null` when the update is complex (caller must fall back to a real
 * re-read — we never guess). Never mutates `before`.
 *
 * Handles: $set, $unset, and shorthand top-level fields (implicit $set, the
 * uncasted PRE shape). Nested dotted paths are applied with lodash set/unset so
 * the resulting object is structurally complete and diffs cleanly against
 * `before` via getDiffObjects.
 */
export const applyUpdateOperators = (
  before: Record<string, unknown>,
  update: UpdateExpr,
  hasArrayFilters = false,
): Record<string, unknown> | null => {
  if (isComplexUpdate(update, hasArrayFilters)) return null;
  if (!before || typeof before !== 'object') return null;

  const after = _loadash.cloneDeep(before);
  const u = update as Record<string, unknown>;

  for (const key of Object.keys(u)) {
    if (key === '$set') {
      applySet(after, u[key]);
    } else if (key === '$unset') {
      applyUnset(after, u[key]);
    } else if (IGNORABLE_UPDATE_OPERATORS.has(key)) {
      // Insert-only operator ($setOnInsert): no effect on an existing doc → skip.
      continue;
    } else if (!key.startsWith('$')) {
      // Shorthand top-level field == $set: { [key]: value }.
      _loadash.set(after, key, u[key]);
    }
    // (No other $-operator is reachable: isComplexUpdate already rejected
    // anything that isn't $set/$unset/shorthand/ignorable.)
  }

  return after;
};

/** Apply a `$set` payload (`{ path: value, … }`) onto the cloned after image. */
const applySet = (after: Record<string, unknown>, setObj: unknown): void => {
  if (!setObj || typeof setObj !== 'object' || Array.isArray(setObj)) return;
  for (const [path, value] of Object.entries(setObj as Record<string, unknown>)) {
    _loadash.set(after, path, value);
  }
};

/** Apply a `$unset` payload (`{ path: '' , … }`) onto the cloned after image. */
const applyUnset = (after: Record<string, unknown>, unsetObj: unknown): void => {
  if (!unsetObj || typeof unsetObj !== 'object' || Array.isArray(unsetObj)) {
    return;
  }
  for (const path of Object.keys(unsetObj)) {
    _loadash.unset(after, path);
  }
};
