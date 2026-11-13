import type { Activity, ActivityTarget } from '@erxes/core-contract';
import { activities, type Db, files, newId } from '@erxes/core-db';
import { and, eq, inArray, like, sql } from 'drizzle-orm';
import { z } from 'zod';
import { can } from '~/http/access';
import { type Actor, type Caller, userCaller } from '~/http/auth';
import { HttpError, notFound } from '~/http/errors';
import { unique } from '~/lib/contacts';
import { assertMembers } from '~/lib/guards';
import { oneRow } from '~/lib/rows';
import { notify } from '~/modules/notifications/notifications.service';
import { assertTimelineAccess, isCoreTarget } from './timelineAccess';

export type ActivityRow = typeof activities.$inferSelect;

const Reactions = z.record(z.string(), z.array(z.string()));

/** Members' reactions kept in an entry's data (emoji → user ids), or undefined. */
export const reactionsOf = (data: Record<string, unknown>) =>
  Reactions.safeParse(data.reactions).data;

export const toActivityDto = (row: ActivityRow): Activity => ({
  id: row.id,
  targetType: row.targetType,
  targetId: row.targetId,
  source: row.source,
  type: row.type,
  summary: row.summary,
  data: row.data,
  entity: row.entityType && row.entityId ? { type: row.entityType, id: row.entityId } : null,
  link: row.link,
  actor: { type: row.actorType, id: row.actorId },
  pinned: row.pinnedAt !== null,
  editedAt: row.editedAt?.toISOString() ?? null,
  reactions: reactionsOf(row.data) ?? {},
  occurredAt: row.occurredAt.toISOString(),
});

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
export const recordActivity = async (
  client: Db,
  caller: Caller,
  entries: CoreActivity | CoreActivity[],
) => {
  const list = Array.isArray(entries) ? entries : [entries];

  if (!list.length) return;

  await client.insert(activities).values(
    list.map((entry) => ({
      id: newId(),
      targetType: entry.targetType,
      targetId: entry.targetId,
      source: 'core',
      type: entry.type,
      data: entry.data ?? {},
      actorType: caller.actorType,
      actorId: caller.actorId,
    })),
  );
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

export const isNote = like(activities.type, '%.note');

const NoteData = z.object({
  body: z.string(),
  mentions: z.array(z.string()).default([]),
  fileIds: z.array(z.string()).default([]),
  history: z.array(z.object({ body: z.string(), editedAt: z.string() })).default([]),
});

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
    throw new HttpError(400, 'INVALID_FILE', 'Attach files uploaded to this organisation');
  }

  return wanted;
};

/** Mentioned members hear about it (people already mentioned before an edit don't, again). */
const notifyMentions = async (
  tx: Db,
  actor: Actor,
  note: { id: string; targetType: string; targetId: string; body: string },
  userIds: string[],
) => {
  const recipients = userIds.filter((id) => id !== actor.userId);

  if (!recipients.length) return;

  await notify(tx, userCaller(actor), {
    userIds: recipients,
    kind: 'core.note.mentioned',
    title: 'You were mentioned in a note',
    body: snippet(note.body),
    link: recordLink(note.targetType, note.targetId),
    entity: { type: note.targetType, id: note.targetId },
    dedupeKey: `note:${note.id}:${recipients.join(',')}`,
  });
};

const findNote = async (client: Db, id: string) => {
  const [row] = await client
    .select()
    .from(activities)
    .where(and(eq(activities.id, id), isNote))
    .limit(1);

  if (!row) throw notFound('Note');

  return row;
};

export const addNote = async (
  client: Db,
  actor: Actor,
  input: {
    targetType: string;
    targetId: string;
    body: string;
    mentions: string[];
    fileIds: string[];
  },
) => {
  await assertTimelineAccess(
    client,
    { actor, orgId: actor.orgId },
    input.targetType,
    input.targetId,
  );

  const mentions = unique(input.mentions);

  await assertMembers(client, mentions);

  const fileIds = await checkFiles(client, input.fileIds);

  const row = oneRow(
    await client
      .insert(activities)
      .values({
        id: newId(),
        targetType: input.targetType,
        targetId: input.targetId,
        source: 'core',
        type: `${input.targetType}.note`,
        data: { body: input.body, mentions, fileIds },
        actorType: 'user',
        actorId: actor.userId,
      })
      .returning(),
  );

  await notifyMentions(client, actor, { ...input, id: row.id }, mentions);

  return toActivityDto(row);
};

/** The note's new data: text, mentions and files, with earlier wordings kept (the last 20). */
const editedData = async (
  client: Db,
  note: ActivityRow,
  input: { body?: string; mentions?: string[]; fileIds?: string[] },
) => {
  const data = NoteData.parse(note.data);
  const mentions = input.mentions === undefined ? data.mentions : unique(input.mentions);

  await assertMembers(client, mentions);

  const fileIds =
    input.fileIds === undefined ? data.fileIds : await checkFiles(client, input.fileIds);

  const reworded = input.body !== undefined && input.body !== data.body;
  const editedAt = (note.editedAt ?? note.occurredAt).toISOString();

  const history = [...data.history, ...(reworded ? [{ body: data.body, editedAt }] : [])].slice(
    -20,
  );

  const reactions = reactionsOf(note.data);

  return {
    data: {
      body: input.body ?? data.body,
      mentions,
      fileIds,
      history,
      ...(reactions ? { reactions } : {}),
    },
    added: mentions.filter((userId) => !data.mentions.includes(userId)),
  };
};

/** The author edits the text; anyone in the organisation pins or unpins. */
export const updateNote = async (
  client: Db,
  actor: Actor,
  id: string,
  input: { body?: string; mentions?: string[]; fileIds?: string[]; pinned?: boolean },
) => {
  const note = await findNote(client, id);

  const editing =
    input.body !== undefined || input.mentions !== undefined || input.fileIds !== undefined;

  if (editing && note.actorId !== actor.userId) {
    throw new HttpError(403, 'NOT_AUTHOR', 'Only the author can edit a note');
  }

  const edit = await editedData(client, note, input);

  const row = oneRow(
    await client
      .update(activities)
      .set({
        ...(editing ? { data: edit.data, editedAt: sql`now()` } : {}),
        ...(input.pinned !== undefined ? { pinnedAt: input.pinned ? sql`now()` : null } : {}),
      })
      .where(eq(activities.id, id))
      .returning(),
  );

  await notifyMentions(
    client,
    actor,
    { id, targetType: note.targetType, targetId: note.targetId, body: edit.data.body },
    edit.added,
  );

  return toActivityDto(row);
};

export const removeNote = async (client: Db, actor: Actor, id: string) => {
  const note = await findNote(client, id);

  if (note.actorId !== actor.userId && !can(actor, 'notes.moderate')) {
    throw new HttpError(
      403,
      'NOT_ALLOWED',
      'Only the author or an owner or admin can delete a note',
    );
  }

  await client.delete(activities).where(eq(activities.id, id));

  return { ok: true as const };
};
