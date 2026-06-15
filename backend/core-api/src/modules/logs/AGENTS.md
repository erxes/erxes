# Logs module — point-in-time revert (undo)

This module owns the event log **and** the point-in-time revert ("undo") feature:
any create/update/delete made through erxes can be journaled and later reverted,
dynamically, with no per-entity code.

## Mechanism, end to end

1. **Correlate** — every request carries one `processId` (AsyncLocalStorage,
   `erxes-api-shared/.../runtimeContext.ts`); the apollo layer honors an inbound
   `x-erxes-process-id` header (so the AI agent can stamp its actions).
2. **Capture (dynamic, zero per-call-site)** — a global hook lives in the shared
   `schemaWrapper` (`erxes-api-shared/src/utils/mongo/revertCapture.ts`), which
   EVERY model schema runs through. It auto-journals:
   - **deletes** (`deleteOne`/`deleteMany`/`findOneAndDelete`) with the pre-image,
   - **edits** (`updateOne`/`updateMany`/`findOneAndUpdate` + `doc.save()`) as a
     before→after diff.
   Creates are intentionally NOT captured (revert of a new record = delete it).
   Each entry records `mongooseName` + `dbName`. It posts to the SAME `put_log`
   BullMQ queue the manual `sendDbEventLog` uses, so the existing pipeline stores
   it in `{subdomain}_logs`.
   - **Gated** behind `REVERT_AUTO_JOURNAL=enable` — a complete no-op when off
     (zero risk to the ~124 wrapped schemas). Must be set on EVERY writing
     service, and is off by default (changes before enabling are unrecoverable).
   - Every hook is wrapped so a capture failure can never block/throw out of a
     write. Bulk capture is capped at `REVERT_AUTO_JOURNAL_MAX` (default 1000).
3. **Invert** — `revert/computeInverse.ts` (pure): create→delete,
   delete→re-insert (keep `_id`), update→restore prior field values.
4. **Revert** — `logsRevertProcess(processId, dryRun, force, skipConflicts,
   resolutions)` GraphQL mutation → `revert/revertByProcessId.ts` reverse-replays
   the process's entries.

## Revert engine (`revert/`)

- `revertByProcessId.ts` — orchestrator: load entries (newest-first), **dedup**
  exact duplicates, **authorize**, plan inverses, detect conflicts, dry-run or
  apply, write a marker.
- `computeInverse.ts` — pure inverse per entry. `conflict.ts` — field-level
  conflict detection (volatile fields like `updatedAt`/`searchText` are excluded).
- `applyWrite.ts` — raw mongoose write (NOT audited statics) + whole-doc guards +
  ES re-sync. `applyInverse.ts` — dispatch core/`auto:` in-process vs remote TRPC.
- `contentTypeConfig.ts` / `../sanitize.ts` / `trpc.ts` / `types.ts`.

### Zero-config
An entity needs **no `meta/logs` entry**: the model is resolved from
`config.mongooseName || payload.mongooseName || payload.collectionName`, and
authz is **actor-or-admin** (owner, or the user who made every change). A
`meta/logs` entry is still honored (gives a configured permission/contentType).

### Authorization
Actor-or-admin: an admin/owner, or the user who made every change in the process.
No per-entity permission setup required.

## Safety guards
- **Multi-connection**: capture records the DB it wrote to; revert refuses an
  entry whose model resolves to a DIFFERENT database (`dbName` mismatch) instead
  of silently writing to the wrong DB → surfaced as `unrevertable`.
- **Conflicts → merge**: if a record changed since, the field-level diff is
  surfaced (revertValue vs currentValue) and the caller passes `resolutions`
  (`restore`/`keep`/`custom`) — not a blind overwrite. `force` (admin only) blind-
  restores.
- **Idempotent**: a complete revert writes a marker (`payload.complete`); re-runs
  return `alreadyReverted`. Re-inserts are idempotent.

## UI (`frontend/core-ui/src/modules/logs`)
On the **System Logs** screen, the log-detail sheet renders `LogRevertPanel`
(shown for Mongo data-change logs AND the GraphQL mutation log of the same
request — they share the processId; the `logsRevertProcess` log itself is
excluded). Flow: "Revert this action" → dry-run preview → "Confirm revert", or a
side-by-side field-level merge chooser ("Keep current" vs "Restore previous",
with "Restore all"/"Keep all") when there are conflicts. `useRevertProcess`
(`preview`/`apply`) + `LOGS_REVERT_PROCESS`.

## Known gaps (not production-done)
- Cascade completeness untested (a delete may restore the parent but not related
  docs unless they pass through hooked ops).
- Standalone Mongo = no transactions → a multi-doc revert can partially apply
  (the result reports `reverted` vs `conflicts`).
- Bulk capture >`REVERT_AUTO_JOURNAL_MAX` truncates without a marker yet.
- The old `MongoLogDetailContent` panel may still show "No document snapshot"
  even when one was captured (cosmetic).
- UI doesn't auto-refetch lists after a revert; System Logs is admin-only.
- Org/separate-connection entities are *guarded* (refused), not yet revertable.
- Branch `feat/erxes-agent-process-correlation`; not yet in a PR (stacked on
  #8023). `REVERT_AUTO_JOURNAL` off by default.
