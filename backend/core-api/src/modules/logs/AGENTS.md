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
3. **Invert** — `revert/computeInverse.ts` (pure): create→delete, delete→re-insert
   (keep `_id`), update→restore prior field values.
4. **Revert** — `logsRevertProcess(processId, dryRun, force, skipConflicts,
resolutions)` → `revert/revertByProcessId.ts` reverse-replays the process's
   entries (dedup → authorize → plan → conflicts → dry-run/apply → marker).

### Flag

Capture is gated behind **`REVERT_AUTO_JOURNAL=enable`** — a complete no-op when
off (zero risk to the ~124 wrapped schemas). Must be set on EVERY writing service;
off by default (changes before enabling are unrecoverable). Bulk capture capped at
`REVERT_AUTO_JOURNAL_MAX` (default 1000). Every hook is wrapped so a capture
failure can never block/throw out of a write.

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
  `registerRevertContentTypeResolver`. Gated by `REVERT_AUTO_JOURNAL`.
- `mongoose-utils.ts` — `schemaWrapper` calls `installRevertCaptureHooks`.
- `index.ts` — re-exports revertCapture. ⚠️ After editing shared, **`pnpm build`**
  it and **restart** consumers (it's loaded as built dist, not via tsx-watch).

**Journal consumer:** `backend/services/logs/src/bullmq/mongo.ts`

- `handleDelete`/`handleDeleteMany`/`handleUpdate` + dispatcher. Stores
  `prevDocument(s)` / `updateDescription` + `mongooseName` + `dbName`. (Fixed: the
  single-`delete` path used to drop `prevDocument`.)

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
- Enable capture: `REVERT_AUTO_JOURNAL=enable` on core-api (and any writing svc).
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
- `.save()` capture coded but not independently live-verified.
- Old `MongoLogDetailContent` panel may still show "No document snapshot" even
  when one was captured (cosmetic).
- UI doesn't auto-refetch lists after revert; System Logs is admin-only.
- Org/separate-connection entities are _guarded_ (refused), not yet revertable
  (needs connection-aware applyWrite).
- No automated tests; perf of the extra read-per-write is unmeasured; not human-
  reviewed/CI'd; not in a PR.

## Commit trail (branch feat/erxes-agent-process-correlation)

`d61d4bbde9` engine (Phase 3b) · `bd6242ec8e` pitfall fixes · `5b2d545975`
dynamic delete capture · `6ea1c9db10` zero-config · `e4200f70bb` edit capture ·
`c0ab1d5560` Undo UI · `58673e8495` .save + multi-conn guard · `656dea0cbe`
dedup · `39c9af1a49`/`5e3a742c5f`/`bedda42486`/`3e05fa3892` UI fixes.
