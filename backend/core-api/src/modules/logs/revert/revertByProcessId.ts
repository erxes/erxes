import {
  set as lodashSet,
  unset as lodashUnset,
  cloneDeep,
} from 'lodash';
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

interface LeanLogEntry extends RevertableLogEntry {
  createdAt?: Date;
  userId?: string;
}

const resolutionKey = (contentType: string, docId: string) =>
  `${contentType}::${docId}`;

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

  for (const field of resolution.fields) {
    if (field.mode === 'keep') {
      delete set[field.field];
      unset = unset.filter((p) => p !== field.field);
    } else if (field.mode === 'custom') {
      set[field.field] = field.value;
      unset = unset.filter((p) => p !== field.field);
    }
    // 'restore' -> leave as computed.
  }

  return { ...op, set, unset };
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
  const { models, subdomain, user, checkPermission } = context;
  const { processId } = args;
  const dryRun = args.dryRun ?? false;
  // force: apply the recorded prev value even over an intervening change
  // (blind restore). Admin/owner only — non-owners get the merge-first flow.
  const force = (args.force ?? false) && !!user?.isOwner;
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

  // 2. Resolve each entry's contentType config and gate per-entity.
  const configMap = await buildContentTypeConfigMap();

  const distinctContentTypes = Array.from(
    new Set(entries.map((e) => e.contentType).filter((c): c is string => !!c)),
  );

  const unauthorized: string[] = [];
  const requiredActions = new Set<string>();

  for (const contentType of distinctContentTypes) {
    const config = configMap.get(contentType);

    // Owners bypass everything (matches checkPermission's isOwner short-circuit).
    if (user?.isOwner) {
      continue;
    }

    if (!config?.permission) {
      // Fail closed: an entity with no declared gate is revertible by owners only.
      unauthorized.push(contentType);
      continue;
    }

    requiredActions.add(config.permission);
  }

  // Enforce each distinct gating action (throws FORBIDDEN on deny). Collect the
  // ones the caller lacks so the whole-revert refusal can list every entity.
  for (const action of requiredActions) {
    try {
      await checkPermission(action);
    } catch {
      const blockedContentTypes = distinctContentTypes.filter(
        (ct) => configMap.get(ct)?.permission === action,
      );
      unauthorized.push(...blockedContentTypes);
    }
  }

  if (unauthorized.length) {
    const unique = Array.from(new Set(unauthorized)).sort();
    throw new Error(
      `Not authorized to revert these entities: ${unique.join(', ')}. ` +
        `A revert requires the gating permission for every entity in the process.`,
    );
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

  for (const entry of entries) {
    const contentType = entry.contentType;
    const config: ResolvedContentTypeConfig | undefined = contentType
      ? configMap.get(contentType)
      : undefined;

    if (!contentType || !config?.mongooseName) {
      unrevertable.push({
        contentType,
        docId: entry.docId,
        action: entry.action,
        reason: 'No mongoose model configured for this contentType',
      });
      continue;
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

    const mongooseName = config.mongooseName;
    const pluginName = contentType.split(':')[0];
    const simKey = resolutionKey(contentType, inverse.docId);

    if (inverse.kind === 'insert') {
      // A hard delete lacking a snapshot would have skipped in computeInverse;
      // reaching here means we have the document to re-insert.
      cleanOps.push({
        kind: 'insert',
        contentType,
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
        contentType,
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
    if (pluginName !== 'core') {
      cleanOps.push(
        mergeResolutionIntoUpdate(
          {
            kind: 'update',
            contentType,
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
          contentType,
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
        contentType,
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
      alreadyReverted: !!existingMarker,
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
    alreadyReverted: !!existingMarker,
  };
};
