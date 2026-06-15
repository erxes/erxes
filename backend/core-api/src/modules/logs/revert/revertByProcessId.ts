import { set as lodashSet, unset as lodashUnset, cloneDeep } from 'lodash';
import { IContext } from '~/connectionResolvers';
import { applyInverse } from './applyInverse';
import { computeInverse, RevertableLogEntry } from './computeInverse';
import { detectUpdateConflicts } from './conflict';
import {
  buildContentTypeConfigMap,
  ResolvedContentTypeConfig,
} from './contentTypeConfig';
import { sanitizeLogValue } from '../sanitize';
import {
  ApplyWriteInput,
  DocConflict,
  RevertDocResolution,
  RevertProcessResult,
  UnrevertableEntry,
} from './types';

const REVERT_SOURCE = 'revert';
const REVERT_ACTION = 'revertProcess';

// Log actions that represent an actual document change (and so can be inverted).
// Every mutation ALSO writes a generic `action:'mutation'` audit entry that
// carries no contentType and changes nothing; such non-data entries must be
// skipped outright, never surfaced as phantom "unrevertable" items on a revert
// that otherwise fully succeeded.
const DATA_CHANGE_ACTIONS = new Set<string>([
  'create',
  'update',
  'delete',
  'deleteMany',
  'updateMany',
  'bulkWrite',
]);

interface LeanLogEntry extends RevertableLogEntry {
  createdAt?: Date;
  userId?: string;
}

/** Stable map key for a doc resolution: `contentType::docId`. */
const resolutionKey = (contentType: string, docId: string) =>
  `${contentType}::${docId}`;

/** Mask PII in a conflict's revert/current field values before it reaches the client. */
const sanitizeConflict = (conflict: DocConflict): DocConflict => ({
  ...conflict,
  fields: conflict.fields.map((field) => ({
    field: field.field,
    revertValue: sanitizeLogValue(field.revertValue, field.field),
    currentValue: sanitizeLogValue(field.currentValue, field.field),
  })),
});

/**
 * Apply a doc's field-level resolutions onto a computed update inverse op.
 * For each resolved field:
 *   - restore -> keep the revert's prev value (already in set/unset)
 *   - keep    -> drop the field from set/unset (leave the live value)
 *   - custom  -> $set the supplied value
 */
const mergeResolutionIntoUpdate = (
  op: Extract<ApplyWriteInput, { kind: 'update' }>,
  resolution: RevertDocResolution | undefined,
): Extract<ApplyWriteInput, { kind: 'update' }> => {
  if (!resolution) {
    return op;
  }

  const set: Record<string, unknown> = { ...op.set };
  let unset = [...op.unset];
  // Fields the caller chose to KEEP (live value) are dropped from the revert's
  // computed `set` by rebuilding it below, rather than a dynamic-key `delete`.
  const keepFields = new Set<string>();

  for (const field of resolution.fields) {
    if (field.mode === 'keep') {
      keepFields.add(field.field);
      unset = unset.filter((p) => p !== field.field);
    } else if (field.mode === 'custom') {
      set[field.field] = field.value;
      unset = unset.filter((p) => p !== field.field);
    }
    // 'restore' -> leave as computed.
  }

  const mergedSet = keepFields.size
    ? Object.fromEntries(
        Object.entries(set).filter(([key]) => !keepFields.has(key)),
      )
    : set;

  return { ...op, set: mergedSet, unset };
};

/**
 * Advance a simulated doc state by an update inverse we just planned, so an older
 * (chained) update to the SAME doc is conflict-checked against the correct
 * intermediate state — not a single stale live read. Without this, a process with
 * two updates to one field (1->2, 2->3; live=3) would match the newer entry but
 * raise a false conflict on the older one and leave the doc at 2 instead of 1.
 */
const advanceSimulated = (
  doc: Record<string, unknown>,
  op: Extract<ApplyWriteInput, { kind: 'update' }>,
): Record<string, unknown> => {
  const next = cloneDeep(doc);
  for (const [path, value] of Object.entries(op.set)) {
    lodashSet(next, path, value);
  }
  for (const path of op.unset) {
    lodashUnset(next, path);
  }
  return next;
};

/**
 * Orchestrate a point-in-time revert of every change carrying `processId`.
 *
 * Reverse-replays the process's log entries (newest -> oldest), per-entity
 * authorized, conflict-aware. Clean entries always apply; conflicted docs apply
 * only when a resolution is supplied. Hard deletes without a snapshot are
 * surfaced as unrevertable. The revert's own writes (and its marker) log under
 * the CURRENT request's processId, never the target — so the revert is itself
 * auditable and never self-cancels.
 */
// skipcq: JS-R1005 — sequential orchestrator; its complexity is the enumerated,
// individually-documented set of revert-entry cases. Splitting it would scatter
// tightly-coupled planning state (simulated map, dedup set, op accumulators)
// across helpers without reducing the real branching.
export const revertByProcessId = async (
  context: IContext,
  args: {
    processId: string;
    dryRun?: boolean;
    force?: boolean;
    skipConflicts?: boolean;
    resolutions?: RevertDocResolution[];
  },
): Promise<RevertProcessResult> => {
  const { models, subdomain, user } = context;
  const { processId } = args;
  const dryRun = args.dryRun ?? false;
  // force: apply the recorded prev value even over an intervening change
  // (blind restore). Admin/owner only — non-owners get the merge-first flow.
  const force = (args.force ?? false) && Boolean(user?.isOwner);
  // skipConflicts: the caller acknowledges conflicts and wants the clean
  // entries reverted while conflicted docs are reported (partial-apply). In the
  // merge-first model this is already the default; the flag is recorded for
  // auditability of the caller's intent.
  const skipConflicts = args.skipConflicts ?? false;
  const resolutions = args.resolutions || [];

  const requestProcessId = context.processId;

  if (!processId) {
    throw new Error('processId is required');
  }

  // The revert writes under the REQUEST processId — never reuse the target.
  if (processId === requestProcessId) {
    throw new Error('Refusing to revert the current request process');
  }

  // 1. Load the process's entries, newest first (reverse-replay order).
  const entries = (await models.Logs.find({ processId })
    .sort({ createdAt: -1 })
    .lean()) as unknown as LeanLogEntry[];

  if (!entries.length) {
    throw new Error(`No log entries found for process ${processId}`);
  }

  // 2. Build the content-type config (used for model resolution + display) and
  // authorize with a zero-config rule: ACTOR-OR-ADMIN. A revert is allowed only
  // for an admin/owner, or for the user who themselves made EVERY change in the
  // process. The actor is recorded on each journal entry, so an entity needs no
  // per-entity permission setup to be revertible.
  const configMap = await buildContentTypeConfigMap();

  if (!user?.isOwner) {
    const actorIds = entries
      .filter((e) => DATA_CHANGE_ACTIONS.has(e.action))
      .map((e) => e.userId)
      .filter((id): id is string => Boolean(id));

    const allMadeByMe =
      actorIds.length > 0 && actorIds.every((id) => id === user?._id);

    if (!allMadeByMe) {
      throw new Error(
        'Not authorized: only an admin, or the user who made these changes, can revert them.',
      );
    }
  }

  // 3. Idempotency: was this process already reverted successfully?
  // Only a COMPLETE marker locks idempotency — a partial revert (conflicts left
  // for a merge-resolution re-call) must not short-circuit the follow-up.
  const existingMarker = await models.Logs.findOne({
    source: REVERT_SOURCE,
    action: REVERT_ACTION,
    'payload.revertedProcessId': processId,
    'payload.complete': true,
  }).lean();

  if (existingMarker && !dryRun) {
    return {
      processId,
      requestProcessId,
      dryRun,
      reverted: [],
      conflicts: [],
      unrevertable: [],
      alreadyReverted: true,
    };
  }

  // 4. Plan: compute inverses, detect conflicts, classify unrevertables.
  const mainConnection = models.Customers.db;

  const resolutionMap = new Map<string, RevertDocResolution>();
  for (const r of resolutions) {
    resolutionMap.set(resolutionKey(r.contentType, r.docId), r);
  }

  const cleanOps: ApplyWriteInput[] = [];
  const conflicts: DocConflict[] = [];
  const unrevertable: UnrevertableEntry[] = [];

  // Simulated post-inverse state per doc (key = contentType::docId), seeded from
  // the live doc and advanced as each update inverse is planned. `null` = the doc
  // is (or becomes) absent in the simulation. Only used for core entities, whose
  // models are registered on this connection.
  const simulated = new Map<string, Record<string, unknown> | null>();

  // Collapse exact-duplicate entries (e.g. an entity that BOTH manually logs and
  // is auto-captured produces two identical entries for one change). Keyed by the
  // change content, so genuinely-distinct chained updates to one doc are kept.
  const seenEntries = new Set<string>();

  for (const entry of entries) {
    // Skip non-data audit/meta entries (e.g. the per-mutation `mutation` wrapper
    // log) — they change no document, so they are neither revertable nor a real
    // gap. Surfacing them as "unrevertable" wrongly implies data was left behind.
    if (!DATA_CHANGE_ACTIONS.has(entry.action)) {
      continue;
    }

    const dedupKey = `${entry.contentType}::${entry.docId}::${entry.action}::${
      entry.action === 'update'
        ? JSON.stringify(
            (entry.payload as { updateDescription?: unknown } | undefined)
              ?.updateDescription || {},
          )
        : 'x'
    }`;
    if (seenEntries.has(dedupKey)) {
      continue;
    }
    seenEntries.add(dedupKey);

    const contentType = entry.contentType;
    const config: ResolvedContentTypeConfig | undefined = contentType
      ? configMap.get(contentType)
      : undefined;

    // Zero-config model resolution: prefer a configured mongooseName, else the
    // model name the auto-capture recorded on the entry, else the collection name
    // (which is the registered model name for core collections). This is what lets
    // ANY captured entity be reverted without a meta/logs entry.
    const mongooseName =
      config?.mongooseName ||
      (entry.payload as { mongooseName?: string } | undefined)?.mongooseName ||
      (entry.payload as { collectionName?: string } | undefined)
        ?.collectionName;

    if (!mongooseName) {
      unrevertable.push({
        contentType,
        docId: entry.docId,
        action: entry.action,
        reason: 'Could not resolve a model for this entry',
      });
      continue;
    }

    // Multi-connection safety: the auto-capture records which database the write
    // actually hit. If the model we can resolve here lives on a DIFFERENT database
    // (e.g. an org-scoped entity captured from another connection), refuse rather
    // than silently writing the revert into the wrong database.
    const recordedDbName = (entry.payload as { dbName?: string } | undefined)
      ?.dbName;
    if (recordedDbName) {
      let localDbName: string | undefined;
      try {
        localDbName = mainConnection.model(mongooseName)?.db?.name;
      } catch {
        localDbName = undefined;
      }
      if (localDbName && localDbName !== recordedDbName) {
        unrevertable.push({
          contentType,
          docId: entry.docId,
          action: entry.action,
          reason: `Entity lives on a different database (${recordedDbName}); cannot revert it from here.`,
        });
        continue;
      }
    }

    const inverse = computeInverse(entry);

    if (inverse.kind === 'skip') {
      unrevertable.push({
        contentType,
        docId: entry.docId,
        action: entry.action,
        reason: inverse.reason,
      });
      continue;
    }

    // A stable, always-defined contentType for the write/simulation layer
    // (auto-derived from the model when an entry carried none).
    const ct: string = contentType || `auto:${mongooseName}.${mongooseName}`;
    const pluginName = ct.split(':')[0];
    const simKey = resolutionKey(ct, inverse.docId);

    if (inverse.kind === 'insert') {
      // A hard delete lacking a snapshot would have skipped in computeInverse;
      // reaching here means we have the document to re-insert.
      cleanOps.push({
        kind: 'insert',
        contentType: ct,
        docId: inverse.docId,
        mongooseName,
        document: inverse.document,
      });
      // After re-insert the doc exists again as its restored snapshot.
      simulated.set(simKey, inverse.document);
      continue;
    }

    if (inverse.kind === 'delete') {
      // The snapshot the original `create` produced — lets applyWrite refuse to
      // delete a doc that changed since creation (undo-create conflict guard).
      const expectDocument =
        entry.payload?.fullDocument &&
        typeof entry.payload.fullDocument === 'object'
          ? (entry.payload.fullDocument as Record<string, unknown>)
          : undefined;

      cleanOps.push({
        kind: 'delete',
        contentType: ct,
        docId: inverse.docId,
        mongooseName,
        expectDocument,
      });
      // After delete the doc is absent in the simulation.
      simulated.set(simKey, null);
      continue;
    }

    // update.
    const resolution = resolutionMap.get(simKey);

    // Field-level conflict detection must read the live doc, which only works for
    // models registered on THIS (core) connection. v1 limitation: remote-plugin
    // entities are applied via TRPC without a local field-level preview (the
    // in-plugin applyWrite still guards inserts/deletes). Reachable only once a
    // plugin declares meta.logs contentTypes — none do today.
    if (pluginName !== 'core' && pluginName !== 'auto') {
      cleanOps.push(
        mergeResolutionIntoUpdate(
          {
            kind: 'update',
            contentType: ct,
            docId: inverse.docId,
            mongooseName,
            set: inverse.set,
            unset: inverse.unset,
          },
          resolution,
        ),
      );
      continue;
    }

    // Seed the simulated state from the live doc on first touch, then reuse it so
    // chained updates to the same doc compare against the correct intermediate
    // state (not a single stale read — see advanceSimulated).
    let simDoc: Record<string, unknown> | null;
    if (simulated.has(simKey)) {
      simDoc = simulated.get(simKey) ?? null;
    } else {
      simDoc = (await mainConnection
        .model<Record<string, unknown>>(mongooseName)
        .findById(inverse.docId)
        .lean()) as Record<string, unknown> | null;
      simulated.set(simKey, simDoc);
    }

    if (!simDoc) {
      unrevertable.push({
        contentType,
        docId: entry.docId,
        action: entry.action,
        reason: 'Target document no longer exists; cannot revert an update',
      });
      continue;
    }

    const fieldConflicts = detectUpdateConflicts(entry, simDoc);

    if (fieldConflicts.length && !force) {
      // Which conflicted fields remain unresolved by the supplied resolutions?
      const resolvedFields = new Set(
        (resolution?.fields || []).map((f) => f.field),
      );
      const unresolved = fieldConflicts.filter(
        (c) => !resolvedFields.has(c.field),
      );

      // Any unresolved conflict means this doc is NOT applied (whether the caller
      // is in skipConflicts mode or awaiting a resolution) — it is only reported.
      // The simulation is left unchanged so an older update to the same doc is
      // checked against the same unreverted state. (force, admin-only, blind-restores.)
      if (unresolved.length) {
        conflicts.push({
          contentType: ct,
          docId: inverse.docId,
          mongooseName,
          fields: fieldConflicts,
        });
        continue;
      }
    }

    const updateOp = mergeResolutionIntoUpdate(
      {
        kind: 'update',
        contentType: ct,
        docId: inverse.docId,
        mongooseName,
        set: inverse.set,
        unset: inverse.unset,
      },
      resolution,
    );

    cleanOps.push(updateOp);
    // Advance the simulated state by the inverse we just planned.
    simulated.set(simKey, advanceSimulated(simDoc, updateOp));
  }

  // 5. Dry-run: preview only, sanitize snapshots returned to the client.
  if (dryRun) {
    return {
      processId,
      requestProcessId,
      dryRun: true,
      reverted: cleanOps.map((op) => ({
        contentType: op.contentType,
        docId: op.docId,
        kind: op.kind,
      })),
      conflicts: conflicts.map(sanitizeConflict),
      unrevertable,
      alreadyReverted: Boolean(existingMarker),
    };
  }

  // 6. Apply clean + resolved ops. Each applyInverse forwards the REQUEST
  //    processId so the reverted writes log under it (never the target).
  const applied: Array<{ contentType: string; docId: string; kind: string }> =
    [];
  const applyConflicts: DocConflict[] = [...conflicts];

  for (const op of cleanOps) {
    const result = await applyInverse({
      connection: mainConnection,
      subdomain,
      input: op,
      requestProcessId,
      userId: user?._id || '',
    });

    if (result.ok) {
      applied.push({
        contentType: op.contentType,
        docId: op.docId,
        kind: op.kind,
      });
    } else {
      applyConflicts.push({
        contentType: op.contentType,
        docId: op.docId,
        mongooseName: op.mongooseName,
        fields: [
          {
            field: '*',
            revertValue: undefined,
            currentValue: result.liveState,
          },
        ],
      });
    }
  }

  // 7. Audit + idempotency marker under the REQUEST processId. The marker LOCKS
  //    idempotency only when the revert is complete (no conflicts awaiting a merge
  //    resolution): `payload.complete` gates the step-3 short-circuit, so a re-call
  //    carrying `resolutions` can still finish a partially-applied revert. (status
  //    stays enum-valid 'success' — the apply itself succeeded for what it could.)
  const complete = applyConflicts.length === 0;

  await models.Logs.create({
    source: REVERT_SOURCE,
    action: REVERT_ACTION,
    status: 'success',
    createdAt: new Date(),
    userId: user?._id,
    processId: requestProcessId,
    payload: {
      revertedProcessId: processId,
      complete,
      appliedCount: applied.length,
      conflictCount: applyConflicts.length,
      unrevertableCount: unrevertable.length,
      force,
      skipConflicts,
    },
  });

  return {
    processId,
    requestProcessId,
    dryRun: false,
    reverted: applied,
    conflicts: applyConflicts.map(sanitizeConflict),
    unrevertable,
    alreadyReverted: Boolean(existingMarker),
  };
};
