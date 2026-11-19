/**
 * Old audit history → `core_audit_logs` (source `erxes3`): `logs` (3.x, who changed what, with
 * the record before and after), `erxes_logs.logs` (every write old erxes made, from its change
 * stream) and activity entries no timeline shows. Changes become `{ field: [before, after] }`;
 * the rest goes to `metadata`. Passwords, tokens and keys in old documents are redacted. Core
 * chains each entry to the one before (a trigger), so entries are written oldest first per batch.
 */
import type { Document } from 'mongodb';
import { z } from 'zod';
import { targetOf } from './activityKinds';
import { resolve } from './idMap';
import { eachBatch, idSet, insert, type Run } from './run';
import { createdOf, idOf, readOr, record, text, when } from './values';

const SECRET = /pass(word)?|token|secret|api_?key|access_?key|private_?key|credential|salt|otp/i;

/** The value with every secret-looking key's value replaced. */
export const redact = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(redact);

  if (!value || typeof value !== 'object' || value instanceof Date) return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, inner]) => [
      key,
      SECRET.test(key) ? '[redacted]' : redact(inner),
    ]),
  );
};

/** One field's `[before, after]`, or `[redacted]` for a secret field. */
const changePair = (key: string, before: unknown, after: unknown): [string, unknown] => [
  key,
  SECRET.test(key) ? '[redacted]' : redact([before ?? null, after ?? null]),
];

const parsedJson = (value: unknown): unknown => {
  if (typeof value !== 'string' || !value.trim()) return value ?? null;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const objectOf = (value: unknown) =>
  value && typeof value === 'object' && !Array.isArray(value) ? Object.entries(value) : [];

/** `{ field: [before, after] }` for the top-level fields that differ. */
export const changesOf = (before: unknown, after: unknown) => {
  const old = new Map(objectOf(before));
  const now = new Map(objectOf(after));

  const keys = [...new Set([...old.keys(), ...now.keys()])].filter(
    (key) => key !== 'updatedAt' && JSON.stringify(old.get(key)) !== JSON.stringify(now.get(key)),
  );

  return keys.length
    ? Object.fromEntries(keys.map((key) => changePair(key, old.get(key), now.get(key))))
    : null;
};

export interface OldAudit {
  type: string | null;
  action: string | null;
  targetId: string | null;
  actorId: string | null;
  summary: string | null;
  at: Date;
  changes?: Record<string, unknown> | null;
  data: unknown;
}

/** One audit row; the actor is a member who exists now, else the system (their old id kept). */
export const auditRowOf = (id: string, old: OldAudit, members: Set<string>) => {
  const targetType = targetOf(old.type) ?? old.type;
  const actor = old.actorId && resolve('user', old.actorId);
  const known = actor && members.has(actor) ? actor : null;

  const targetId =
    old.targetId && (targetType === 'customer' || targetType === 'company')
      ? resolve(targetType, old.targetId)
      : old.targetId;

  return [
    id,
    known ? 'user' : 'system',
    known,
    `${targetType ?? 'record'}.${old.action ?? 'change'}`,
    targetType,
    targetId,
    old.summary,
    old.changes ? JSON.stringify(old.changes) : null,
    JSON.stringify(redact({ oldActorId: known ? undefined : old.actorId, old: old.data })),
    old.at,
    'erxes3',
  ];
};

const COLUMNS = [
  'id',
  'actor_type',
  'actor_id',
  'action',
  'target_type',
  'target_id',
  'target_label',
  'changes',
  'metadata',
  'created_at',
  'source',
];

/** Writes audit rows oldest first, so the chain follows time within a batch. */
export const writeAudit = async (run: Run, collection: string, rows: unknown[][]) => {
  const ordered = rows.toSorted((a, b) => Number(a[9]) - Number(b[9]));

  await insert(run, {
    collection,
    table: 'core_audit_logs',
    columns: COLUMNS,
    rows: ordered,
    keys: ordered.map((row) => String(row[0])),
  });
};

const Log = record({
  type: text,
  action: text,
  objectId: text,
  createdBy: text,
  description: text,
  oldData: z.unknown().optional(),
  newData: z.unknown().optional(),
  addedData: z.unknown().optional(),
  removedData: z.unknown().optional(),
  extraDesc: z.unknown().optional(),
  createdAt: when,
});

/** A 3.x `logs` entry: the record before and after, as JSON text. */
export const logAudit = (log: NonNullable<ReturnType<typeof Log.parse>>): OldAudit => {
  const before = parsedJson(log.oldData);
  const after = parsedJson(log.newData);

  return {
    type: log.type,
    action: log.action,
    targetId: log.objectId,
    actorId: log.createdBy,
    summary: log.description,
    at: createdOf(log.id, log.createdAt),
    changes: log.action === 'update' ? changesOf(before, after) : null,
    data: {
      ...(log.action === 'update' ? {} : { record: after ?? before }),
      added: parsedJson(log.addedData),
      removed: parsedJson(log.removedData),
      extra: parsedJson(log.extraDesc),
    },
  };
};

const Change = record({
  source: text,
  status: text,
  userId: text,
  docId: text,
  contentType: text,
  action: text,
  payload: z.unknown().optional(),
  createdAt: when,
});

const Payload = z.object({
  collectionName: text,
  fullDocument: z.unknown().optional(),
  updateDescription: z
    .object({
      updated: z.record(z.string(), z.unknown()).optional(),
      added: z.unknown().optional(),
    })
    .optional(),
});

const PrevCurrent = z.object({ prev: z.unknown(), current: z.unknown() });

/** An `erxes_logs.logs` entry: one write old erxes made, with what it changed. */
export const changeAudit = (change: NonNullable<ReturnType<typeof Change.parse>>): OldAudit => {
  const payload = Payload.safeParse(change.payload ?? {});
  const update = payload.success ? payload.data.updateDescription : undefined;

  const updated = objectOf(update?.updated).flatMap(([key, value]): [string, unknown][] => {
    const pair = PrevCurrent.safeParse(value);

    return pair.success && key !== 'updatedAt'
      ? [changePair(key, pair.data.prev, pair.data.current)]
      : [];
  });

  const added = objectOf(update?.added).map(([key, value]) => changePair(key, null, value));

  const changes = Object.fromEntries([...updated, ...added]);

  return {
    type: change.contentType ?? (payload.success ? payload.data.collectionName : null),
    action: change.action,
    targetId: change.docId,
    actorId: change.userId,
    summary: null,
    at: createdOf(change.id, change.createdAt),
    changes: Object.keys(changes).length ? changes : null,
    data: {
      source: change.source,
      status: change.status,
      ...(update ? {} : { payload: change.payload ?? null }),
    },
  };
};

/** `logs` and `erxes_logs.logs`, each entry an audit row. */
export const importAuditLogs = async (run: Run) => {
  const members = await idSet(run, 'core_users');

  const pass = (
    name: string,
    prefix: string,
    read: (raw: Document) => { id: string; old: OldAudit } | null,
  ) => {
    run.report.of(name, 'core_audit_logs');

    return eachBatch(
      run,
      name === 'logs' ? run.mongo.collection('logs') : run.other('erxes_logs').collection('logs'),
      (documents) =>
        writeAudit(
          run,
          name,
          documents.flatMap((raw) => {
            const entry = read(raw);

            if (!entry) run.report.skip(name, 'unreadable _id', idOf(raw));

            return entry ? [auditRowOf(`${prefix}${entry.id}`, entry.old, members)] : [];
          }),
        ),
      {},
      name,
    );
  };

  await pass('logs', 'l_', (raw) => {
    const log = readOr(Log, raw);

    return log && { id: log.id, old: logAudit(log) };
  });
  await pass('erxes_logs.logs', 'x_', (raw) => {
    const change = readOr(Change, raw);

    return change && { id: change.id, old: changeAudit(change) };
  });
};
