/**
 * `internal_notes` → a `core_activities` entry of type `<record type>.note` plus its
 * `core_notes` row, as core's own note import writes them, keeping the old id. Old notes were
 * HTML; core notes are plain text, so the HTML becomes text and its @mentions the member ids.
 * Notes on a plugin's record are entries from that plugin, on records that still exist in old
 * erxes. Core timelines are for customers, companies and plugin records, so notes on products
 * and members stay out.
 */
import { convert } from 'html-to-text';
import type { Db, Document } from 'mongodb';
import { z } from 'zod';
import { CONTENT_TYPES } from './fields';
import { resolve } from './idMap';
import { eachBatch, existing, idSet, insert, type Run } from './run';
import { mainSource } from './sources';
import { createdOf, idOf, optionalId, readOr, record, text, when } from './values';

const NoteDocument = record({
  contentType: text,
  contentTypeId: optionalId,
  createdUserId: optionalId,
  content: z.unknown().optional(),
  createdAt: when,
  updatedAt: when,
});

type NoteDocument = NonNullable<ReturnType<typeof NoteDocument.parse>>;

/** Plugin record types → the plugin and the old collection that holds its records. */
const PLUGIN_RECORDS: Record<string, { plugin: string; collection: string }> = {
  'sales.deal': { plugin: 'sales', collection: 'deals' },
  'operation.task': { plugin: 'operation', collection: 'tasks' },
  'operation.project': { plugin: 'operation', collection: 'operation_projects' },
  'frontline.ticket': { plugin: 'frontline', collection: 'tickets' },
  'frontline.conversation': { plugin: 'frontline', collection: 'conversations' },
};

const CORE_TARGETS = new Set(['customer', 'company']);

/**
 * The note's text: paragraphs and line breaks kept, links and images as their address, and
 * non-breaking spaces (the old editor's `&nbsp;`) as plain ones.
 */
export const noteText = (content: unknown) =>
  typeof content === 'string'
    ? convert(content, {
        wordwrap: false,
        selectors: [{ selector: 'a', options: { hideLinkHrefIfSameAsText: true } }],
      })
        .replaceAll(' ', ' ')
        .trim()
    : '';

/** Member ids an old note mentioned (`mentioned-user-id="…"`). */
export const mentionsOf = (content: unknown) =>
  typeof content === 'string'
    ? [
        ...new Set(
          [...content.matchAll(/mentioned-user-id="([^"]+)"/g)].map((match) => match[1] ?? ''),
        ),
      ]
    : [];

/** Where a note goes: core's record type, and the plugin for plugin records. */
export const noteTarget = (contentType: string | null) => {
  const targetType = CONTENT_TYPES[contentType ?? ''];

  if (!targetType) return null;

  if (CORE_TARGETS.has(targetType)) return { targetType, source: 'core', collection: null };

  const plugin = PLUGIN_RECORDS[targetType];

  return plugin ? { targetType, source: plugin.plugin, collection: plugin.collection } : null;
};

/** The old record ids, per plugin collection, that still exist in old erxes. */
const pluginRecords = async (db: Db, notes: NoteDocument[]) => {
  const wanted = new Map<string, string[]>();

  for (const note of notes) {
    const target = noteTarget(note.contentType);

    if (target?.collection && note.contentTypeId) {
      wanted.set(target.collection, [...(wanted.get(target.collection) ?? []), note.contentTypeId]);
    }
  }

  const found = await Promise.all(
    [...wanted].map(async ([collection, ids]) =>
      (
        await db
          .collection<{ _id: string }>(collection)
          .find({ _id: { $in: ids } }, { projection: { _id: 1 } })
          .toArray()
      ).map(idOf),
    ),
  );

  return new Set(found.flat());
};

interface Context {
  members: Set<string>;
  customers: Set<string>;
  companies: Set<string>;
  plugins: Set<string>;
}

/** The note's target id as core knows it, or why it has none. */
const targetIdOf = (
  note: NoteDocument,
  targetType: string,
  context: Context,
): { id: string } | { skip: string } => {
  const id = note.contentTypeId;

  if (!id) return { skip: 'no record' };

  if (targetType === 'customer') {
    const customer = resolve('customer', id);

    return context.customers.has(customer) ? { id: customer } : { skip: 'customer not in core' };
  }

  if (targetType === 'company') {
    const company = resolve('company', id);

    return context.companies.has(company) ? { id: company } : { skip: 'company not in core' };
  }

  return context.plugins.has(id) ? { id } : { skip: `${targetType} gone from old erxes` };
};

/** The timeline entry: by its author when they are a member, else by the system. */
const entryRow = (
  kept: { note: NoteDocument; target: { targetType: string; source: string }; targetId: string },
  members: Set<string>,
) => {
  const { note, target } = kept;
  const author = note.createdUserId && resolve('user', note.createdUserId);
  const known = author && members.has(author) ? author : null;
  const at = createdOf(note.id, note.createdAt, note.updatedAt);

  return [
    note.id,
    target.targetType,
    kept.targetId,
    target.source,
    `${target.targetType}.note`,
    known ? 'user' : 'system',
    known,
    `officenext:note:${note.id}`,
    at,
    at,
  ];
};

const noteBatch = async (
  run: Run,
  db: Db,
  name: string,
  members: Set<string>,
  documents: Document[],
) => {
  const notes = documents.flatMap((raw) => {
    const note = readOr(NoteDocument, raw);

    if (!note) run.report.skip(name, 'unreadable _id', idOf(raw));

    return note ? [note] : [];
  });

  const context: Context = {
    members,
    customers: await existing(
      run,
      'core_customers',
      notes.map((note) => resolve('customer', note.contentTypeId ?? '')),
    ),
    companies: await existing(
      run,
      'core_companies',
      notes.map((note) => resolve('company', note.contentTypeId ?? '')),
    ),
    plugins: await pluginRecords(db, notes),
  };

  const kept = notes.flatMap((note) => {
    const target = noteTarget(note.contentType);
    const body = noteText(note.content);

    if (!target) {
      run.report.skip(name, `no timeline for ${note.contentType ?? '(none)'}`, note.id);

      return [];
    }

    const targetId = targetIdOf(note, target.targetType, context);

    if ('skip' in targetId) run.report.skip(name, targetId.skip, note.id);
    else if (!body) run.report.skip(name, 'empty note', note.id);

    return 'id' in targetId && body ? [{ note, target, targetId: targetId.id, body }] : [];
  });

  await insert(run, {
    collection: name,
    table: 'core_activities',
    columns: [
      'id',
      'target_type',
      'target_id',
      'source',
      'type',
      'actor_type',
      'actor_id',
      'dedupe_key',
      'occurred_at',
      'created_at',
    ],
    rows: kept.map((each) => entryRow(each, members)),
    keys: kept.map(({ note }) => note.id),
  });

  // A note row needs its entry: notes whose entry was refused fail their foreign key and are skipped.
  run.report.seen(`${name} (bodies)`, kept.length);
  await insert(run, {
    collection: `${name} (bodies)`,
    table: 'core_notes',
    columns: ['id', 'body', 'mentions'],
    rows: kept.map(({ note, body }) => [
      note.id,
      body,
      mentionsOf(note.content)
        .map((id) => resolve('user', id))
        .filter((id) => members.has(id)),
    ]),
    keys: kept.map(({ note }) => note.id),
  });
};

/** Internal notes of `source`: `erxes`'s, or those only the v1 copy has. */
export const importNotes = async (run: Run, source = mainSource(run, 'internal_notes')) => {
  const { db, name } = source;
  const members = await idSet(run, 'core_users');

  run.report.of(name, 'core_activities, core_notes');
  run.report.of(`${name} (bodies)`, 'core_notes');

  await eachBatch(
    run,
    db.collection(source.collection),
    (documents) => noteBatch(run, db, name, members, documents),
    source.filter,
    name,
  );
};
