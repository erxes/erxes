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
import { mainSource, OldId, type Source, stillThere } from './sources';
import { createdOf, idOf, ids, optionalId, readOr, record, text, when } from './values';

const NoteDocument = record({
  contentType: text,
  contentTypeId: optionalId,
  createdUserId: optionalId,
  mentions: ids,
  content: z.unknown().optional(),
  createdAt: when,
  updatedAt: when,
});

type NoteDocument = NonNullable<ReturnType<typeof NoteDocument.parse>>;

/** Plugin record types → the plugin and the old collections that hold its records. */
const PLUGIN_RECORDS: Record<string, { plugin: string; collections: string[] }> = {
  'sales.deal': { plugin: 'sales', collections: ['deals'] },
  'operation.task': { plugin: 'operation', collections: ['tasks', 'operation_tasks'] },
  'operation.project': { plugin: 'operation', collections: ['operation_projects'] },
  'frontline.ticket': { plugin: 'frontline', collections: ['tickets', 'frontline_tickets'] },
  'frontline.conversation': { plugin: 'frontline', collections: ['conversations'] },
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

  if (CORE_TARGETS.has(targetType)) return { targetType, source: 'core', collections: [] };

  const plugin = PLUGIN_RECORDS[targetType];

  return plugin ? { targetType, source: plugin.plugin, collections: plugin.collections } : null;
};

/** The old record ids, per plugin collection, that still exist in old erxes. */
const pluginRecords = async (db: Db, notes: NoteDocument[]) => {
  const wanted = new Map<string, string[]>();

  for (const note of notes) {
    const target = noteTarget(note.contentType);

    for (const collection of target?.collections ?? []) {
      if (note.contentTypeId)
        wanted.set(collection, [...(wanted.get(collection) ?? []), note.contentTypeId]);
    }
  }

  const found = await Promise.all(
    [...wanted].map(([collection, recordIds]) => stillThere(db, collection, recordIds)),
  );

  return new Set(found.flatMap((there) => [...there]));
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
      [...new Set([...mentionsOf(note.content), ...note.mentions])]
        .map((id) => resolve('user', id))
        .filter((id) => members.has(id)),
    ]),
    keys: kept.map(({ note }) => note.id),
  });
};

/**
 * Internal notes of `source`: `erxes`'s, those only the v1 copy has, or a plugin's own notes,
 * which `asNote` turns into an internal note (its record type and the record's id).
 */
export const importNotes = async (
  run: Run,
  source = mainSource(run, 'internal_notes'),
  asNote = (raw: Document) => raw,
) => {
  const { db, name } = source;
  const members = await idSet(run, 'core_users');

  run.report.of(name, 'core_activities, core_notes');
  run.report.of(`${name} (bodies)`, 'core_notes');

  await eachBatch(
    run,
    db.collection(source.collection),
    (documents) => noteBatch(run, db, name, members, documents.map(asNote)),
    source.filter,
    name,
  );
};

const PluginNote = record({ contentId: optionalId, createdBy: optionalId });

/** A plugin's note as an internal note on its record. */
const onRecord = (contentType: string) => (raw: Document) => {
  const note = readOr(PluginNote, raw);

  return { ...raw, contentType, contentTypeId: note?.contentId, createdUserId: note?.createdBy };
};

/** The `contentId`s, as stored, of Operation notes on a project that still exists. */
const onProjects = async (source: Source) => {
  const stored = (await source.db.collection(source.collection).distinct('contentId')).flatMap(
    (id: unknown) => OldId.safeParse(id).data ?? [],
  );

  const projects = await stillThere(
    source.db,
    'operation_projects',
    stored.map((id) => idOf({ _id: id })),
  );

  return stored.filter((id) => projects.has(idOf({ _id: id })));
};

/**
 * Notes Operation and Frontline kept themselves: on tasks and projects, and a ticket's internal
 * ones.
 */
export const importPluginNotes = async (run: Run) => {
  const operation = mainSource(run, 'operation_notes');
  const tickets = mainSource(run, 'frontline_tickets_notes');
  const projects = await onProjects(operation);

  const comments = await tickets.db
    .collection(tickets.collection)
    .countDocuments({ isInternal: { $ne: true } });

  await importNotes(
    run,
    { ...operation, filter: { contentId: { $in: projects } } },
    onRecord('operation:project'),
  );
  await importNotes(
    run,
    { ...operation, filter: { contentId: { $nin: projects } } },
    onRecord('operation:task'),
  );
  await importNotes(
    run,
    { ...tickets, filter: { isInternal: true } },
    onRecord('frontline:ticket'),
  );
  run.report.seen(tickets.name, comments);
  run.report.skip(tickets.name, 'ticket comment: plugin:frontline', '', comments);
};
