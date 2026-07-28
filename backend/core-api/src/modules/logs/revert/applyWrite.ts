import { isEqual } from 'lodash';
import { Connection, Model } from 'mongoose';
import { saveEsDoc, deleteEsDoc } from 'erxes-api-shared/utils';
import { ApplyWriteInput, ApplyWriteResult } from './types';

/**
 * Apply a single inverse op via RAW mongoose model methods (create / updateOne /
 * deleteOne), NEVER the audited statics (createCustomer, etc.) — raw writes
 * avoid double-logging, recursion and dedup-rejection, while the schema still
 * casts types (string -> ObjectId, dates, defaults). The original _id is always
 * preserved so references pointing at a restored doc are made whole again.
 *
 * Whole-doc conflict guards (field-level update conflicts are detected upstream):
 *   - insert (undo a delete): live must be ABSENT — never overwrite a doc that
 *     was re-created in the interim.
 *   - delete (undo a create): live must still MATCH the created snapshot — never
 *     delete a doc that diverged since creation.
 *   - update: applied directly; its conflicts were resolved by the orchestrator.
 *
 * After a successful Mongo write the change is mirrored into Elasticsearch
 * (gated on isUsingElk inside the helper), since there is no in-process
 * Mongo->ES pipeline at the model layer.
 */

type RawDoc = Record<string, unknown>;

/** Resolve the entity model for a mongooseName on the given connection. */
const resolveModel = (
  connection: Connection,
  mongooseName: string,
): Model<RawDoc> => {
  return connection.model<RawDoc>(mongooseName);
};

/**
 * Whole-doc guard for a delete-inverse (undo a create): the live doc must still
 * match the snapshot the create produced (ignoring volatile bookkeeping fields).
 */
export const createSnapshotMatchesLive = (
  createdDoc: RawDoc | null | undefined,
  liveDoc: RawDoc | null | undefined,
): boolean => {
  if (!createdDoc || !liveDoc) {
    return false;
  }
  /** Drop volatile bookkeeping fields (updatedAt, __v) before comparison. */
  const strip = (d: RawDoc) => {
    const { updatedAt: _u, __v: _v, ...rest } = d;
    return rest;
  };
  return isEqual(strip(createdDoc), strip(liveDoc));
};

/**
 * Mirror a revert write into Elasticsearch — BEST-EFFORT. Mongo is the source of
 * truth for the revert; ES is only a search mirror (also re-synced out of band by
 * the oplog tailer). A revert must NEVER fail or report an error because ES is
 * unreachable or misconfigured, so any ES error here is swallowed — the
 * authoritative Mongo write has already succeeded by this point.
 */
const mirrorToEs = async (fn: () => Promise<unknown>): Promise<void> => {
  try {
    await fn();
  } catch {
    /* best-effort ES mirror; never surface to the revert result */
  }
};

/**
 * Apply one computed inverse op (insert/delete/update) as a raw model write with
 * its conflict guards, then mirror the change into Elasticsearch. Returns a
 * structured {ok} | {conflict} result instead of throwing on a benign conflict.
 */
export const applyWrite = async (args: {
  connection: Connection;
  subdomain: string;
  input: ApplyWriteInput;
}): Promise<ApplyWriteResult> => {
  const { connection, subdomain, input } = args;
  const model = resolveModel(connection, input.mongooseName);

  if (input.kind === 'insert') {
    const existing = (await model
      .findById(input.docId)
      .lean()) as RawDoc | null;
    if (existing) {
      // Idempotency: if the live doc already equals what we'd restore, a prior
      // revert (or a re-call carrying merge resolutions) already did this — treat
      // it as applied, not a conflict, so the merge re-call flow converges.
      if (createSnapshotMatchesLive(input.document, existing)) {
        return { ok: true };
      }
      return {
        ok: false,
        conflict: true,
        reason:
          'A document with this _id already exists (re-created in the interim)',
        liveState: existing,
      };
    }

    // Re-insert preserving the original _id so references re-resolve. Provenance
    // (which revert restored it) is recorded in the revert marker log under
    // requestProcessId — entity schemas are strict, so an inline restoredFrom
    // stamp would be silently dropped and is intentionally omitted here.
    const document: RawDoc = {
      ...input.document,
      _id: input.docId,
    };

    await model.create(document);

    await mirrorToEs(() =>
      saveEsDoc({
        subdomain,
        contentType: input.contentType,
        _id: input.docId,
        document,
      }),
    );

    return { ok: true };
  }

  if (input.kind === 'delete') {
    const existing = (await model
      .findById(input.docId)
      .lean()) as RawDoc | null;
    if (!existing) {
      // Already gone — the desired post-state holds. Treat as applied.
      return { ok: true };
    }

    // Undo-a-create guard: only delete if the live doc still matches the snapshot
    // the create produced. An intervening change means deleting would destroy it.
    if (
      input.expectDocument &&
      !createSnapshotMatchesLive(input.expectDocument, existing)
    ) {
      return {
        ok: false,
        conflict: true,
        reason:
          'Document changed since it was created; refusing to delete (undo-create conflict)',
        liveState: existing,
      };
    }

    await model.deleteOne({ _id: input.docId });

    await mirrorToEs(() =>
      deleteEsDoc({
        subdomain,
        contentType: input.contentType,
        _id: input.docId,
      }),
    );

    return { ok: true };
  }

  // update
  const update: Record<string, unknown> = {};
  if (Object.keys(input.set).length) {
    update.$set = input.set;
  }
  if (input.unset.length) {
    update.$unset = input.unset.reduce<Record<string, ''>>((acc, path) => {
      acc[path] = '';
      return acc;
    }, {});
  }

  if (!Object.keys(update).length) {
    return { ok: true };
  }

  await model.updateOne({ _id: input.docId }, update);

  const fresh = (await model.findById(input.docId).lean()) as RawDoc | null;
  if (fresh) {
    await mirrorToEs(() =>
      saveEsDoc({
        subdomain,
        contentType: input.contentType,
        _id: input.docId,
        document: fresh,
      }),
    );
  }

  return { ok: true };
};
