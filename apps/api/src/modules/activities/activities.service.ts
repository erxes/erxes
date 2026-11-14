import type { ActivityTarget } from '@erxes/core-contract';
import {
  activities,
  actorOf,
  caller,
  type Db,
  files,
  newId,
  notes,
  noteVersions,
  reactions,
  users,
} from '@erxes/core-db';
import { and, desc, eq, getTableColumns, inArray, sql } from 'drizzle-orm';
import { callerCan } from '~/http/access';
import { fail, notFound } from '~/http/errors';
import { unique } from '~/lib/contacts';
import { assertMembers } from '~/lib/guards';
import { lockRows } from '~/lib/locks';
import { oneRow } from '~/lib/rows';
import { notify } from '~/modules/notifications/notifications.service';
import { assertTimelineAccess, isCoreTarget } from './timelineAccess';

/** Emoji → the members who reacted, first reaction first. */
const reactionsColumn = sql<Record<string, string[]>>`coalesce((
  select json_object_agg(r.emoji, r.members order by r.first)
  from (
    select ${reactions.emoji} as emoji,
      array_agg(${reactions.userId} order by ${reactions.createdAt}) as members,
      min(${reactions.createdAt}) as first
    from ${reactions}
    where ${reactions.activityId} = ${activities.id}
    group by ${reactions.emoji}
  ) r
), '{}'::json)`;

/**
 * Timeline entries as the API answers them: the row, its author's name and
 * picture, its note (null for other entries) and its reactions.
 */
export const selectEntries = (client: Db) =>
  client
    .select({
      ...getTableColumns(activities),
      actorName: sql<string | null>`coalesce(nullif(${users.fullName}, ''), ${users.email})`,
      actorAvatarUrl: users.avatarUrl,
      note: {
        body: notes.body,
        mentions: notes.mentions,
        fileIds: notes.fileIds,
        pinnedAt: notes.pinnedAt,
        editedAt: notes.editedAt,
      },
      reactions: reactionsColumn,
    })
    .from(activities)
    .leftJoin(notes, eq(notes.id, activities.id))
    .leftJoin(users, and(eq(activities.actorType, 'user'), eq(users.id, activities.actorId)));

export const entryById = async (client: Db, id: string) =>
  oneRow(await selectEntries(client).where(eq(activities.id, id)).limit(1));

export interface CoreActivity {
  targetType: ActivityTarget;
  targetId: string;
  type: string;
  data?: Record<string, unknown>;
}

/**
 * Adds core's own entries to the timeline. Call it in the same transaction as
 * the change it describes.
 */
export const recordActivity = async (client: Db, entries: CoreActivity | CoreActivity[]) => {
  const list = Array.isArray(entries) ? entries : [entries];

  if (!list.length) return;

  const actor = actorOf(caller());

  await client
    .insert(activities)
    .values(list.map((entry) => ({ id: newId(), source: 'core', ...entry, ...actor })));
};

const targetsOf = (targetType: ActivityTarget, ids: string[]) =>
  and(eq(activities.targetType, targetType), inArray(activities.targetId, ids));

/** Merged records: their timelines move to the record that was kept. */
export const moveActivities = async (
  client: Db,
  targetType: ActivityTarget,
  fromIds: string[],
  toId: string,
) => {
  if (!fromIds.length) return;

  await client.update(activities).set({ targetId: toId }).where(targetsOf(targetType, fromIds));
};

/** Deleted records: their timeline goes too (privacy: nothing is left behind). */
export const removeActivities = async (client: Db, targetType: ActivityTarget, ids: string[]) => {
  if (!ids.length) return;

  await client.delete(activities).where(targetsOf(targetType, ids));
};

/** Where a record lives in erxes (plugin records: their plugin opens them). */
const recordLink = (targetType: string, targetId: string) =>
  isCoreTarget(targetType)
    ? `/contacts/${targetType === 'customer' ? 'customers' : 'companies'}/${encodeURIComponent(targetId)}`
    : undefined;

const snippet = (body: string) => (body.length > 140 ? `${body.slice(0, 140)}…` : body);

/** 400 INVALID_FILE unless every file is a ready upload of the organisation. */
const checkFiles = async (client: Db, fileIds: string[]) => {
  const wanted = unique(fileIds);

  if (!wanted.length) return wanted;

  const found = await client
    .select({ id: files.id })
    .from(files)
    .where(and(eq(files.status, 'ready'), inArray(files.id, wanted)));

  if (found.length !== wanted.length) {
    throw fail('INVALID_FILE', 'Attach files uploaded to this organisation');
  }

  return wanted;
};

/** Mentioned members hear about it (people already mentioned before an edit don't, again). */
const notifyMentions = async (
  tx: Db,
  note: { id: string; targetType: string; targetId: string; body: string },
  userIds: string[],
) => {
  const recipients = userIds.filter((id) => id !== caller('user').userId);

  if (!recipients.length) return;

  await notify(tx, {
    userIds: recipients,
    kind: 'core.note.mentioned',
    title: 'You were mentioned in a note',
    body: snippet(note.body),
    link: recordLink(note.targetType, note.targetId),
    entityType: note.targetType,
    entityId: note.targetId,
    dedupeKey: `note:${note.id}:${recipients.join(',')}`,
  });
};

/** A note on a timeline the member sees, with where it is and who wrote it. */
const findNote = async (client: Db, id: string) => {
  const [note] = await client
    .select({
      ...getTableColumns(notes),
      targetType: activities.targetType,
      targetId: activities.targetId,
      authorId: activities.actorId,
      occurredAt: activities.occurredAt,
    })
    .from(notes)
    .innerJoin(activities, eq(activities.id, notes.id))
    .where(eq(notes.id, id))
    .limit(1);

  if (!note) throw notFound('Note');

  await assertTimelineAccess(client, note.targetType, note.targetId);

  return note;
};

type NoteRow = Awaited<ReturnType<typeof findNote>>;

/** 403 NOT_AUTHOR unless the member wrote the note. */
const assertAuthor = (note: NoteRow) => {
  if (note.authorId !== caller('user').userId) {
    throw fail('NOT_AUTHOR', 'Only the author can edit a note');
  }
};

/** 403 NOT_ALLOWED unless the member wrote the note or may moderate notes. */
const assertCanModerate = (note: NoteRow) => {
  if (note.authorId !== caller('user').userId && !callerCan('notes.moderate')) {
    throw fail('NOT_ALLOWED', 'Only the author or an owner or admin can delete a note');
  }
};

export const addNote = async (
  client: Db,
  input: {
    targetType: string;
    targetId: string;
    body: string;
    mentions: string[];
    fileIds: string[];
  },
) => {
  await assertTimelineAccess(client, input.targetType, input.targetId);

  const mentions = unique(input.mentions);

  await assertMembers(client, mentions);

  const fileIds = await checkFiles(client, input.fileIds);
  const id = newId();

  await client.insert(activities).values({
    id,
    targetType: input.targetType,
    targetId: input.targetId,
    source: 'core',
    type: `${input.targetType}.note`,
    ...actorOf(caller('user')),
  });
  await client.insert(notes).values({ id, body: input.body, mentions, fileIds });
  await notifyMentions(client, { ...input, id }, mentions);

  return entryById(client, id);
};

/** The author rewords a note, or changes its mentions or files. The replaced wording is kept. */
export const editNote = async (
  client: Db,
  id: string,
  input: { body?: string; mentions?: string[]; fileIds?: string[] },
) => {
  // One edit at a time: each keeps the wording the one before it left.
  await lockRows(client, 'core_notes', [id]);

  const note = await findNote(client, id);

  assertAuthor(note);

  const mentions = input.mentions && unique(input.mentions);

  await assertMembers(client, mentions ?? []);

  const fileIds = input.fileIds && (await checkFiles(client, input.fileIds));
  const reworded = input.body !== undefined && input.body !== note.body;

  if (reworded) {
    await client.insert(noteVersions).values({
      id: newId(),
      noteId: id,
      body: note.body,
      editedAt: note.editedAt ?? note.occurredAt,
    });
  }

  await client
    .update(notes)
    .set({ body: input.body, mentions, fileIds, editedAt: reworded ? sql`now()` : undefined })
    .where(eq(notes.id, id));

  await notifyMentions(
    client,
    { id, targetType: note.targetType, targetId: note.targetId, body: input.body ?? note.body },
    (mentions ?? []).filter((userId) => !note.mentions.includes(userId)),
  );

  return entryById(client, id);
};

/** Anyone who sees the timeline pins or unpins a note. */
export const pinNote = async (client: Db, id: string, pinned: boolean) => {
  await findNote(client, id);
  await client
    .update(notes)
    .set({ pinnedAt: pinned ? sql`now()` : null })
    .where(eq(notes.id, id));

  return entryById(client, id);
};

export const listNoteVersions = async (client: Db, id: string) => {
  await findNote(client, id);

  const data = await client
    .select()
    .from(noteVersions)
    .where(eq(noteVersions.noteId, id))
    .orderBy(desc(noteVersions.editedAt))
    .limit(100);

  return { data };
};

export const removeNote = async (client: Db, id: string) => {
  assertCanModerate(await findNote(client, id));

  // The note, its versions and reactions go with the entry.
  await client.delete(activities).where(eq(activities.id, id));

  return { ok: true as const };
};
