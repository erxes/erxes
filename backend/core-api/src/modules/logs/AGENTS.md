# Logs module — point-in-time revert (undo)

This module owns the event log **and** the point-in-time revert ("undo") feature:
any create/update/delete made through erxes can be journaled and later reverted,
**dynamically, with no per-entity code**. Built on branch
`feat/erxes-agent-process-correlation` (stacked on PR #8023; the revert work is
NOT yet in its own PR). Original driver: make the AI `erxes-agent`'s mistakes
recoverable — but it's auth-agnostic (agent and human run under the same user).

---

## Mechanism, end to end

1. **Correlate** — every request carries one `processId` via AsyncLocalStorage
   (`erxes-api-shared/.../eventHandlers/runtimeContext.ts`); the apollo layer
   honors an inbound `x-erxes-process-id` header
   (`erxes-api-shared/.../apollo/utils.ts`), so the agent can stamp its actions.
2. **Capture (dynamic, zero per-call-site)** — a global hook lives in the shared
   `schemaWrapper` (every model schema runs through it). It auto-journals
   **deletes** (with pre-image) and **edits** (before→after diff), recording
   `mongooseName` + `dbName`, onto the same `put_log` BullMQ queue the manual
   `sendDbEventLog` uses → stored in `{subdomain}_logs`. Creates are NOT captured
   (revert of a new record = delete it).

   **Efficient capture path (the common update case does NO post re-read):** the
   update PRE hook stashes the raw update operators (`query.getUpdate()`) and a
   PROJECTED before-snapshot (only the touched paths + `_id`). The POST hook
   synthesizes the after-image **in memory** from `before + operators` for the
   simple cases (`$set` / `$unset` / shorthand fields) — no second query — and
   only falls back to the old post re-read (full doc) for COMPLEX operators (see
   below). Pure helpers `applyUpdateOperators` / `extractTouchedPaths` /
   `isComplexUpdate` live in `mongo/afterImage.ts` and are unit-tested
   (`.personal/revert-afterImage.test.js`). Delete snapshots stay UNPROJECTED
   (revert re-inserts the whole doc). `getDiffObjects` is still the single diff
   source, so the emitted `updateDescription` shape is byte-identical.

   **Fallback operators (force the post re-read; never guessed in memory):**
   `$inc`, `$mul`, `$min`, `$max`, `$rename`, `$currentDate`, `$bit`, `$push`,
   `$pull`, `$pullAll`, `$pop`, `$addToSet`; any positional path
   (`a.$`, `a.$[]`, `a.$[elem]`); any `arrayFilters` option; aggregation-pipeline
   updates (array form); and any unrecognized `$`-operator.

   **`$setOnInsert` is IGNORED, not a fallback** — it only takes effect on an
   upsert-INSERT, and we never journal creates, so it cannot affect any diff we
   capture. This matters because Mongoose auto-injects `$setOnInsert: { createdAt }`
   (and `$set.updatedAt`) into EVERY update on a `timestamps: true` schema (the
   erxes-wide default) BEFORE our pre-hook runs; treating it as complex would force
   ~every real update onto the slow re-read and defeat the optimization. So the
   common in-memory path DOES fire for timestamped schemas.

   **Batched bulk journaling:** a multi-doc `updateMany` now emits ONE `put_log`
   message (`action:'updateBatch'`, `docIds[]`, `payload.updates[]`) instead of N
   jobs; the consumer (`handleUpdateBatch`) `insertMany`s one single-`update` Log
   row per entry — the stored rows are IDENTICAL to the legacy single-`update`
   shape, so `computeInverse`/`conflict` read them unchanged. A single changed doc
   still emits the exact legacy single-`update` job.

   **Selectivity (denylist + opt-out):** `mongo/revertSelectivity.ts` holds a
   small, commented, env-overridable (`REVERT_CAPTURE_DENYLIST`) collection
   denylist. The logs/audit family is ALWAYS skipped (substring match) so the
   journal never journals itself; ephemeral session/queue/lock/metric churn is
   skipped too. `installRevertCaptureHooks` installs ZERO hooks for a denied
   schema that declares its `collection` name, or one that opts out via
   `schema.options.revertCapture === false` / `skipRevertCapture: true`; a runtime
   guard (`isModelDenied`) enforces the always-skip-logs invariant for schemas
   whose collection name is only known at write time. Normal entity collections
   are unchanged (still captured).
3. **Invert** — `revert/computeInverse.ts` (pure): create→delete, delete→re-insert
   (keep `_id`), update→restore prior field values.
4. **Revert** — `logsRevertProcess(processId, dryRun, force, skipConflicts,
resolutions)` → `revert/revertByProcessId.ts` reverse-replays the process's
   entries (dedup → authorize → plan → conflicts → dry-run/apply → marker).

### Always on

Capture is **always on** — there is no enable flag. Every **update/delete**
through any of the ~124 wrapped schemas is journaled from the moment a service
boots, so no edit or deletion is ever silently left unrecoverable. (Creates are
NOT captured — reverting a brand-new record is just deleting it, so a new record
is removable but has no prior state to "restore".) Bulk capture is capped at
`REVERT_AUTO_JOURNAL_MAX` snapshots per write (optional tuning override, default
1000 — capture runs regardless of whether it is set). Every hook is wrapped so a
capture failure can never block/throw out of a write.

### Zero-config + authz

No `meta/logs` entry needed: model resolved from
`config.mongooseName || payload.mongooseName || payload.collectionName`; authz is
**actor-or-admin** (owner, or the user who made every change). A `meta/logs` entry
is still honored when present.

---

## File map (all packages)

**Capture (shared):** `backend/erxes-api-shared/src/utils/mongo/`

- `revertCapture.ts` — the auto-capture: `installRevertCaptureHooks(schema)`
  (pre/post hooks for delete*/update*/save), `journalDeletes`/`journalUpdates`,
  `registerRevertContentTypeResolver`. Always on (no enable flag). Update POST
  computes the after-image in memory (no re-read) for the simple case; emits one
  batched `updateBatch` message for multi-doc updates.
- `afterImage.ts` — PURE (no mongoose runtime): `applyUpdateOperators`,
  `extractTouchedPaths`, `isComplexUpdate`, `isReplacementUpdate`,
  `COMPLEX_UPDATE_OPERATORS`. The in-memory after-image + simple/complex
  classifier. Unit-tested by `.personal/revert-afterImage.test.js`.
- `revertSelectivity.ts` — `REVERT_CAPTURE_DENYLIST`, `isRevertCaptureDenied`,
  `isSchemaRevertOptedOut`. The collection denylist + per-schema opt-out.
- `mongoose-utils.ts` — `schemaWrapper` calls `installRevertCaptureHooks`.
- `index.ts` — re-exports revertCapture. ⚠️ After editing shared, **`pnpm build`**
  it and **restart** consumers (it's loaded as built dist, not via tsx-watch).

**Journal consumer:** `backend/services/logs/src/bullmq/mongo.ts`

- `handleDelete`/`handleDeleteMany`/`handleUpdate`/`handleUpdateBatch` +
  dispatcher. Stores `prevDocument(s)` / `updateDescription` + `mongooseName` +
  `dbName`. (Fixed: the single-`delete` path used to drop `prevDocument`.)
  `handleUpdateBatch` expands one `updateBatch` message into N `insertMany`'d
  single-`update` rows (identical stored shape; only the queue transport is
  collapsed).

**Engine:** `backend/core-api/src/modules/logs/revert/`

- `revertByProcessId.ts` — orchestrator (load newest-first, dedup, actor-or-admin
  authz, multi-connection guard, plan, conflicts, dry-run/apply, marker).
- `computeInverse.ts` (pure inverse) · `conflict.ts` (field conflicts; volatile
  fields excluded) · `applyWrite.ts` (raw write + whole-doc guards + ES re-sync) ·
  `applyInverse.ts` (core/`auto:` in-process vs remote TRPC) ·
  `contentTypeConfig.ts` · `trpc.ts` · `types.ts`.
- `../sanitize.ts` (mask PII in previews) · `../graphql/{schema,resolvers}` —
  `logsRevertProcess` mutation + `Log` type exposes `processId`/`contentType` and a
  `name` field resolver (`resolvers/customResolvers/log.ts`: the exact operation —
  graphql `payload.mutationName`, else `contentType`/`collectionName` — read off the
  stored doc so the list never ships the full payload; surfaced as the **Operation**
  column in the System Logs table) · `../../../meta/logs.ts` (optional per-entity
  config) · `erxes-api-shared/.../elasticsearch/saveEs.ts`.

**UI:** `frontend/core-ui/src/modules/logs/`

- `components/LogRevertPanel.tsx` — the Undo surface in the log-detail sheet (shown
  for Mongo data-change logs AND the GraphQL mutation log of the same request;
  excludes the `logsRevertProcess` log). Plain-language for non-technical users
  (no "revert/field/processId" jargon; field names humanized, values formatted,
  IDs shown only as a quiet reference). On open it **silently dry-runs** to detect
  an already-undone action and shows an "Already undone" notice instead of the
  button. Otherwise: one-click "Undo this change" → dry-run preview → confirm, or
  the `RevertConflictResolver` when a record was edited in the meantime.
- `components/RevertConflictResolver.tsx` — the merge UI (erxes-ui `ToggleGroup`).
  Calm amber "warning" tone (not destructive red). Per changed field: a segmented
  Restore-previous / Keep-current toggle + a `Previous → Current` comparison where
  the **chosen outcome lights up** (primary), so the resulting value is visible
  before applying. One bulk "Apply to everything" toggle; records grouped with an
  entity Badge + short id when more than one conflicts.
- `utils/revertFormat.ts` — pure plain-language formatters shared by both
  (`formatValue`, `entityNoun`, `humanizeField`, `shortId`, `kindInfo`, `conflictKey`).
- `hooks/useRevertProcess.tsx` (`preview`/`apply`) · `graphql/revertMutations.ts`
  (`LOGS_REVERT_PROCESS`) · `components/LogDetailView.tsx` (renders the panel) ·
  `components/LogDetailPrimitives.tsx` (JSON viewer made dark-theme-readable).

---

## Safety guards

- **Multi-connection**: revert refuses an entry whose model resolves to a
  different database than the recorded `dbName` (→ `unrevertable`), never silently
  writes to the wrong DB.
- **Conflicts → merge** (not blind overwrite): field-level diff + `resolutions`
  (`restore`/`keep`/`custom`); `force` (admin only) blind-restores.
- **Idempotent**: complete revert writes `payload.complete` marker; re-runs return
  `alreadyReverted`; re-inserts are idempotent. Dedup collapses exact duplicates
  (manual + auto double-logging).

---

## Run & test locally

- Stack: Docker Mongo + Redis (+ ES). Services: core-api (`:3300`), logs-service
  (`cd backend/services/logs && pnpm dev` — NOT in the default `nx serve` set, but
  it's what writes `{subdomain}_logs`), gateway (`:4000`) + apollo-router
  (`:50000`), core-ui (`:3001`).
- **Cloud-vs-local trap**: root `.env` `MONGO_URL` points at cloud Atlas; force
  `MONGO_URL=mongodb://127.0.0.1:27017/erxes` for local. Verify the boot log says
  `Connected to the database: mongodb://127.0.0.1...`.
- Capture is always on — no flag to set; it journals from boot on every service.
- Adding a `Log` GraphQL field needs core-api restart **and** a gateway
  recompose (kill `:4000` + `:50000` + the router, relaunch gateway).
- Smoke test: create+delete a tag/department (no `meta/logs` entry → zero-config)
  → `logsRevertProcess(processId)` → verify restored. UI: System Logs → open the
  log → "Revert this action".

---

## Known gaps (NOT production-done)

- Cascade completeness untested (delete may restore the parent but not related
  docs unless they pass through hooked ops).
- Standalone Mongo = no transactions → multi-doc revert can partially apply
  (result reports `reverted` vs `conflicts`).
- Bulk capture >`REVERT_AUTO_JOURNAL_MAX` truncates with no marker yet.
- The in-memory after-image removes the post re-read only for the SIMPLE update
  path ($set/$unset/shorthand); COMPLEX operators (see list above) still do the
  full post re-read. Replacement (`replaceOne`/`findOneAndReplace`) is NOT hooked.
- `.save()` capture coded but not independently live-verified (still reads the
  prior doc once in PRE — it has the after-image via `toObject()`, no re-read).
- Old `MongoLogDetailContent` panel may still show "No document snapshot" even
  when one was captured (cosmetic).
- UI doesn't auto-refetch lists after revert; System Logs is admin-only.
- Org/separate-connection entities are _guarded_ (refused), not yet revertable
  (needs connection-aware applyWrite).
- Pure capture helpers (`afterImage.ts` / `revertSelectivity.ts`) now have a
  standalone unit harness (`.personal/revert-afterImage.test.js`, run with
  `node`), but it is NOT wired into CI/`nx test` (erxes-api-shared has no jest
  target). Engine/consumer integration still has no automated tests; the
  in-memory perf win is reasoned-about, not benchmarked; not human-reviewed/CI'd;
  not in a PR. **Out of scope (follow-ups):** per-doc version/etag field; replica-
  set/change-streams/CDC migration; moving the journal to a separate cluster.

## Commit trail (branch feat/erxes-agent-process-correlation)

`d61d4bbde9` engine (Phase 3b) · `bd6242ec8e` pitfall fixes · `5b2d545975`
dynamic delete capture · `6ea1c9db10` zero-config · `e4200f70bb` edit capture ·
`c0ab1d5560` Undo UI · `58673e8495` .save + multi-conn guard · `656dea0cbe`
dedup · `39c9af1a49`/`5e3a742c5f`/`bedda42486`/`3e05fa3892` UI fixes.
