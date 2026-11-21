/**
 * `activity_logs` → `core_activities`: each entry about a customer, company or plugin record
 * goes on that record's timeline as old erxes history (source `erxes3`, with the sentence old
 * erxes would have shown and the old content in `data`), keeping its id; `dedupe_key` keeps a
 * re-run from adding it twice. Customers and companies have to be in core; plugin records have
 * to still exist in old erxes. Entries about members (sign-ins, permission changes) and other
 * things no timeline shows go to the audit log (`auditLogs.ts`).
 */
import type { Db, Document } from 'mongodb';
import { z } from 'zod';
import { classicSummary, laterSummary, type Names, ownerOf, targetOf } from './activityKinds';
import { auditRowOf, redact, writeAudit } from './auditLogs';
import { resolve } from './idMap';
import { eachBatch, existing, insert, readAll, type Run } from './run';
import { mainSource, stillThere } from './sources';
import { createdOf, idOf, readOr, record, text, when } from './values';

const Entry = record({
  contentType: text,
  contentId: text,
  action: z.unknown().optional(),
  content: z.unknown().optional(),
  createdBy: text,
  activityType: text,
  targetType: text,
  targetId: text,
  actor: z.unknown().optional(),
  changes: z.unknown().optional(),
  metadata: z.unknown().optional(),
  createdAt: when,
});

type Entry = NonNullable<ReturnType<typeof Entry.parse>>;

/** Old collections that hold each plugin record type, to tell whether a record still exists. */
const SOURCES: [string, string][] = [
  ['sales.deal', 'deals'],
  ['operation.task', 'tasks'],
  ['operation.task', 'operation_tasks'],
  ['frontline.ticket', 'tickets'],
  ['frontline.ticket', 'frontline_tickets'],
  ['frontline.conversation', 'conversations'],
];

/** The entry read the same whichever way old erxes wrote it. */
export const readEntry = (entry: Entry, names: Names) => {
  const later = entry.activityType !== null || entry.targetType !== null;
  const oldType = later ? entry.targetType : entry.contentType;
  const action = typeof entry.action === 'string' ? entry.action : null;

  return {
    oldType,
    targetType: targetOf(oldType),
    oldId: later ? entry.targetId : entry.contentId,
    action: later ? entry.activityType : action,
    actorId: entry.createdBy ?? idOf(entry.actor),
    summary: later
      ? laterSummary(entry.activityType, entry.action)
      : classicSummary(action ?? 'change', entry.content, names),
    data: later
      ? { changes: entry.changes ?? null, metadata: entry.metadata ?? null }
      : { content: entry.content ?? null },
  };
};

type Read = ReturnType<typeof readEntry>;

const placed = async (run: Run, db: Db, entries: Read[]) => {
  const ids = (type: string) =>
    entries.flatMap((entry) =>
      entry.targetType === type && entry.oldId
        ? [type === 'customer' || type === 'company' ? resolve(type, entry.oldId) : entry.oldId]
        : [],
    );

  const plugin = await Promise.all(
    SOURCES.map(async ([type, collection]) =>
      [...(await stillThere(db, collection, ids(type)))].map((id) => `${type}:${id}`),
    ),
  );

  return new Set([
    ...[...(await existing(run, 'core_customers', ids('customer')))].map((id) => `customer:${id}`),
    ...[...(await existing(run, 'core_companies', ids('company')))].map((id) => `company:${id}`),
    ...plugin.flat(),
  ]);
};

const keyOf = (entry: Read) => {
  if (!entry.targetType || !entry.oldId) return null;

  const id =
    entry.targetType === 'customer' || entry.targetType === 'company'
      ? resolve(entry.targetType, entry.oldId)
      : entry.oldId;

  return { targetType: entry.targetType, targetId: id, key: `${entry.targetType}:${id}` };
};

/** The timeline row: core's own wording for created customers and companies, else the sentence. */
const activityRow = (
  entry: Entry,
  read: Read,
  target: { targetType: string; targetId: string },
  members: Set<string>,
) => {
  const actor = read.actorId && resolve('user', read.actorId);
  const known = actor && members.has(actor) ? actor : null;
  const at = createdOf(entry.id, entry.createdAt);
  const coreCreated = ownerOf(target.targetType) === 'core' && read.action === 'create';

  return [
    entry.id,
    target.targetType,
    target.targetId,
    coreCreated ? 'core' : 'erxes3',
    coreCreated
      ? `${target.targetType}.created`
      : `${target.targetType}.${read.action ?? 'change'}`,
    coreCreated ? null : read.summary,
    JSON.stringify(redact(read.data)),
    known ? 'user' : 'system',
    known,
    `officenext:activity:${entry.id}`,
    at,
    at,
  ];
};

const COLUMNS = [
  'id',
  'target_type',
  'target_id',
  'source',
  'type',
  'summary',
  'data',
  'actor_type',
  'actor_id',
  'dedupe_key',
  'occurred_at',
  'created_at',
];

const batchOf = async (
  run: Run,
  db: Db,
  name: string,
  context: { names: Names; members: Set<string> },
  documents: Document[],
) => {
  const entries = documents.flatMap((raw) => {
    const entry = readOr(Entry, raw);

    if (!entry) run.report.skip(name, 'unreadable _id', idOf(raw));

    return entry ? [{ entry, read: readEntry(entry, context.names) }] : [];
  });

  const found = await placed(
    run,
    db,
    entries.map(({ read }) => read),
  );

  const timeline: unknown[][] = [];
  const audit: unknown[][] = [];

  for (const { entry, read } of entries) {
    const target = keyOf(read);

    if (target && found.has(target.key))
      timeline.push(activityRow(entry, read, target, context.members));
    else if (!read.oldType && !read.action)
      run.report.skip(name, 'empty entry (no record, no action)', entry.id);
    else if (target) run.report.skip(name, `${target.targetType} no longer exists`, entry.id);
    else
      audit.push(
        auditRowOf(
          `a_${entry.id}`,
          {
            type: read.oldType,
            action: read.action,
            targetId: read.oldId,
            actorId: read.actorId,
            summary: read.summary,
            at: createdOf(entry.id, entry.createdAt),
            data: read.data,
          },
          context.members,
        ),
      );
  }

  await insert(run, {
    collection: name,
    table: 'core_activities',
    columns: COLUMNS,
    rows: timeline,
    keys: timeline.map((row) => String(row[0])),
  });
  run.report.of(`${name} (to audit)`, 'core_audit_logs');
  run.report.seen(`${name} (to audit)`, audit.length);
  await writeAudit(run, `${name} (to audit)`, audit);
};

const Named = record({ name: text });

/** Names the sentences use: members, tags and segments. */
const namesOf = async (run: Run, db: Db): Promise<Names> => {
  const pairs = async (collection: string) =>
    new Map(
      (await readAll(run, collection)).flatMap((doc) => {
        const parsed = readOr(Named, doc);

        return parsed?.name ? [[parsed.id, parsed.name]] : [];
      }),
    );

  const members = await run.pg.query<{ id: string; name: string }>(
    "SELECT id, coalesce(full_name, email, id) AS name FROM core_users WHERE org_id = current_setting('app.org_id')",
  );

  return {
    members: new Map(members.rows.map((row) => [row.id, row.name])),
    tags: await pairs('tags'),
    segments: db === run.mongo ? await pairs('segments') : new Map<string, string>(),
  };
};

/** Activity logs of `source`: `erxes`'s, or those only the v1 copy has. */
export const importActivityLogs = async (run: Run, source = mainSource(run, 'activity_logs')) => {
  const { db, name } = source;
  const names = await namesOf(run, db);
  const members = new Set(names.members.keys());

  run.report.of(name, 'core_activities');
  await eachBatch(
    run,
    db.collection(source.collection),
    (documents) => batchOf(run, db, name, { names, members }, documents),
    source.filter,
    name,
  );
};
