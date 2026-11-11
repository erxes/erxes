import type { Activity, ActivityInput, ActivityTarget, CursorQuery } from '@erxes/core-contract';
import { activities, companies, customerCompanies, customers, type Db, files, newId } from '@erxes/core-db';
import { and, eq, inArray, isNotNull, like, ne, notLike, or, sql } from 'drizzle-orm';
import { type Actor, type Caller, can, type PluginCaller, pluginCaller, userCaller } from '~/http/auth';
import { HttpError, notFound } from '~/http/errors';
import { unique } from '~/lib/contacts';
import { assertMember, assertPluginNamespace } from '~/lib/guards';
import { keysetPage } from '~/lib/keyset';
import { notify } from '~/modules/notifications/notifications.service';

type ActivityRow = typeof activities.$inferSelect;

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
export const recordActivity = async (client: Db, caller: Caller, entries: CoreActivity | CoreActivity[]) => {
  const list = Array.isArray(entries) ? entries : [entries];

  if (!list.length) {
    return;
  }

  await client.insert(activities).values(
    list.map((entry) => ({
      id: newId(),
      orgId: caller.orgId,
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

/** Merged records: their timelines move to the record that was kept. */
export const moveActivities = async (
  client: Db,
  orgId: string,
  targetType: ActivityTarget,
  fromIds: string[],
  toId: string,
) => {
  if (!fromIds.length) {
    return;
  }

  await client
    .update(activities)
    .set({ targetId: toId })
    .where(and(eq(activities.orgId, orgId), eq(activities.targetType, targetType), inArray(activities.targetId, fromIds)));
};

/** Deleted records: their timeline goes too (privacy: nothing is left behind). */
export const removeActivities = async (client: Db, orgId: string, targetType: ActivityTarget, ids: string[]) => {
  if (!ids.length) {
    return;
  }

  await client
    .delete(activities)
    .where(and(eq(activities.orgId, orgId), eq(activities.targetType, targetType), inArray(activities.targetId, ids)));
};

export const assertTarget = async (client: Db, orgId: string, targetType: ActivityTarget, targetId: string) => {
  const table = targetType === 'customer' ? customers : companies;
  const [row] = await client
    .select({ id: table.id })
    .from(table)
    .where(and(eq(table.orgId, orgId), eq(table.id, targetId)))
    .limit(1);

  if (!row) {
    throw notFound(targetType === 'customer' ? 'Customer' : 'Company');
  }
};

const isNote = like(activities.type, '%.note');

export const listActivities = async (
  client: Db,
  actor: Actor,
  query: CursorQuery & {
    targetType: ActivityTarget;
    targetId: string;
    source?: string;
    kind?: 'all' | 'notes' | 'changes' | 'plugins';
    pinned?: boolean;
    includeRelated?: boolean;
  },
) => {
  await assertTarget(client, actor.orgId, query.targetType, query.targetId);

  const own = and(eq(activities.targetType, query.targetType), eq(activities.targetId, query.targetId));
  // A company's timeline can include what happened with its customers.
  const related =
    query.includeRelated && query.targetType === 'company'
      ? and(
          eq(activities.targetType, 'customer'),
          inArray(
            activities.targetId,
            client
              .select({ id: customerCompanies.customerId })
              .from(customerCompanies)
              .where(and(eq(customerCompanies.orgId, actor.orgId), eq(customerCompanies.companyId, query.targetId))),
          ),
        )
      : undefined;
  const kindFilter =
    query.kind === 'notes'
      ? isNote
      : query.kind === 'changes'
        ? and(eq(activities.source, 'core'), notLike(activities.type, '%.note'))
        : query.kind === 'plugins'
          ? ne(activities.source, 'core')
          : undefined;

  const page = await keysetPage(
    client,
    {
      table: activities,
      id: activities.id,
      // Timeline order is when it happened, which a plugin may backdate.
      createdAt: activities.occurredAt,
      scope: and(eq(activities.orgId, actor.orgId), related ? or(own, related) : own)!,
    },
    and(
      query.source ? eq(activities.source, query.source) : undefined,
      kindFilter,
      query.pinned ? isNotNull(activities.pinnedAt) : undefined,
    ),
    query,
    (where, orderBy, limit) =>
      client
        .select()
        .from(activities)
        .where(where)
        .orderBy(...orderBy)
        .limit(limit),
  );

  return { ...page, data: page.data.map(toActivityDto) };
};

// ─── Notes ──────────────────────────────────────────────────────────────────

const recordLink = (targetType: ActivityTarget, targetId: string) =>
  `/contacts/${targetType === 'customer' ? 'customers' : 'companies'}/${encodeURIComponent(targetId)}`;

const snippet = (body: string) => (body.length > 140 ? `${body.slice(0, 140)}…` : body);

/** 400 INVALID_FILE unless every file is a ready upload of the organisation. */
const checkFiles = async (client: Db, orgId: string, fileIds: string[]) => {
  const wanted = unique(fileIds);

  if (!wanted.length) return wanted;

  const found = await client
    .select({ id: files.id })
    .from(files)
    .where(and(eq(files.orgId, orgId), eq(files.status, 'ready'), inArray(files.id, wanted)));

  if (found.length !== wanted.length) {
    throw new HttpError(400, 'INVALID_FILE', 'Attach files uploaded to this organisation');
  }

  return wanted;
};

/** Mentioned members hear about it (people already mentioned before an edit don't, again). */
const notifyMentions = async (
  tx: Db,
  actor: Actor,
  note: { id: string; targetType: ActivityTarget; targetId: string; body: string },
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

const findNote = async (client: Db, orgId: string, id: string) => {
  const [row] = await client
    .select()
    .from(activities)
    .where(and(eq(activities.orgId, orgId), eq(activities.id, id), isNote))
    .limit(1);

  if (!row) {
    throw notFound('Note');
  }

  return row;
};

export const addNote = async (
  client: Db,
  actor: Actor,
  input: { targetType: ActivityTarget; targetId: string; body: string; mentions: string[]; fileIds: string[] },
) => {
  await assertTarget(client, actor.orgId, input.targetType, input.targetId);

  const mentions = unique(input.mentions);

  for (const userId of mentions) await assertMember(client, actor.orgId, userId);

  const fileIds = await checkFiles(client, actor.orgId, input.fileIds);

  return client.transaction(async (tx) => {
    const [row] = await tx
      .insert(activities)
      .values({
        id: newId(),
        orgId: actor.orgId,
        targetType: input.targetType,
        targetId: input.targetId,
        source: 'core',
        type: `${input.targetType}.note`,
        data: { body: input.body, mentions, fileIds },
        actorType: 'user',
        actorId: actor.userId,
      })
      .returning();

    await notifyMentions(tx, actor, { ...input, id: row!.id }, mentions);

    return toActivityDto(row!);
  });
};

/** The author edits the text; anyone in the organisation pins or unpins. */
export const updateNote = async (
  client: Db,
  actor: Actor,
  id: string,
  input: { body?: string; mentions?: string[]; fileIds?: string[]; pinned?: boolean },
) => {
  const note = await findNote(client, actor.orgId, id);
  const editing = input.body !== undefined || input.mentions !== undefined || input.fileIds !== undefined;

  if (editing && note.actorId !== actor.userId) {
    throw new HttpError(403, 'NOT_AUTHOR', 'Only the author can edit a note');
  }

  const data = note.data as { body: string; mentions: string[]; fileIds: string[] };
  const mentions = input.mentions === undefined ? data.mentions : unique(input.mentions);

  for (const userId of mentions) await assertMember(client, actor.orgId, userId);

  const fileIds = input.fileIds === undefined ? data.fileIds : await checkFiles(client, actor.orgId, input.fileIds);
  const body = input.body ?? data.body;

  return client.transaction(async (tx) => {
    const [row] = await tx
      .update(activities)
      .set({
        ...(editing ? { data: { body, mentions, fileIds }, editedAt: sql`now()` } : {}),
        ...(input.pinned !== undefined ? { pinnedAt: input.pinned ? sql`now()` : null } : {}),
      })
      .where(and(eq(activities.orgId, actor.orgId), eq(activities.id, id)))
      .returning();

    const added = mentions.filter((userId) => !data.mentions.includes(userId));

    await notifyMentions(tx, actor, { id, targetType: note.targetType, targetId: note.targetId, body }, added);

    return toActivityDto(row!);
  });
};

export const removeNote = async (client: Db, actor: Actor, id: string) => {
  const note = await findNote(client, actor.orgId, id);

  if (note.actorId !== actor.userId && !can(actor, 'notes.moderate')) {
    throw new HttpError(403, 'NOT_ALLOWED', 'Only the author or an owner or admin can delete a note');
  }

  await client.delete(activities).where(and(eq(activities.orgId, actor.orgId), eq(activities.id, id)));

  return { ok: true as const };
};

/**
 * A plugin event on a record someone owns reaches the owner's inbox for that
 * plugin (muting the plugin mutes these too).
 */
const notifyTargetOwner = async (client: Db, caller: PluginCaller, input: ActivityInput, activity: ActivityRow) => {
  const table = input.targetType === 'customer' ? customers : companies;
  const [target] = await client
    .select({ ownerId: table.ownerId })
    .from(table)
    .where(and(eq(table.orgId, caller.orgId), eq(table.id, input.targetId)))
    .limit(1);

  if (!target?.ownerId || target.ownerId === input.actorUserId) {
    return;
  }

  await notify(client, pluginCaller(caller), {
    userIds: [target.ownerId],
    kind: input.type,
    title: input.summary,
    link: input.link ?? `/contacts/${input.targetType === 'customer' ? 'customers' : 'companies'}/${input.targetId}`,
    entity: input.entity ?? { type: input.targetType, id: input.targetId },
    data: { targetType: input.targetType, targetId: input.targetId },
    actorUserId: input.actorUserId,
    dedupeKey: `activity:${activity.id}`,
  });
};

/**
 * A plugin adds an entry to a customer's or company's timeline. With a
 * `dedupeKey`, a retry returns the entry made the first time (`created: false`).
 */
export const createPluginActivity = async (client: Db, caller: PluginCaller, input: ActivityInput) => {
  assertPluginNamespace(caller.plugin, input.type);
  await assertTarget(client, caller.orgId, input.targetType, input.targetId);
  await assertMember(client, caller.orgId, input.actorUserId);

  const [inserted] = await client
    .insert(activities)
    .values({
      id: newId(),
      orgId: caller.orgId,
      targetType: input.targetType,
      targetId: input.targetId,
      source: caller.plugin,
      type: input.type,
      summary: input.summary,
      data: input.data ?? {},
      entityType: input.entity?.type ?? null,
      entityId: input.entity?.id ?? null,
      link: input.link ?? null,
      actorType: input.actorUserId ? 'user' : 'plugin',
      actorId: input.actorUserId ?? caller.plugin,
      dedupeKey: input.dedupeKey ?? null,
      occurredAt: input.occurredAt ? new Date(input.occurredAt) : sql`now()`,
    })
    .onConflictDoNothing()
    .returning();

  if (inserted) {
    await notifyTargetOwner(client, caller, input, inserted);

    return { activity: toActivityDto(inserted), created: true };
  }

  const [existing] = await client
    .select()
    .from(activities)
    .where(
      and(
        eq(activities.orgId, caller.orgId),
        eq(activities.source, caller.plugin),
        eq(activities.dedupeKey, input.dedupeKey ?? ''),
      ),
    )
    .limit(1);

  return { activity: toActivityDto(existing!), created: false };
};
