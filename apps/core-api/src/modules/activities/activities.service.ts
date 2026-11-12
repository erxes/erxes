import type { Activity, ActivityInput, ActivityTarget, CursorQuery } from '@erxes/core-contract';
import {
  activities,
  companies,
  customerCompanies,
  customers,
  type Db,
  files,
  newId,
  pluginInstallations,
  plugins,
  users,
} from '@erxes/core-db';
import { and, eq, inArray, isNotNull, like, ne, notLike, or, sql } from 'drizzle-orm';
import {
  type Actor,
  type Caller,
  can,
  type PluginCaller,
  pluginCaller,
  userCaller,
} from '~/http/auth';
import { HttpError, notFound } from '~/http/errors';
import { unique } from '~/lib/contacts';
import { assertMember, assertPluginNamespace } from '~/lib/guards';
import { keysetPage } from '~/lib/keyset';
import { notify } from '~/modules/notifications/notifications.service';
import { guardDeletions } from '~/lib/deletionGuard';

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
  reactions: (row.data as { reactions?: Record<string, string[]> }).reactions ?? {},
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
    .where(
      and(
        eq(activities.orgId, orgId),
        eq(activities.targetType, targetType),
        inArray(activities.targetId, fromIds),
      ),
    );
};

/** Deleted records: their timeline goes too (privacy: nothing is left behind). */
export const removeActivities = async (
  client: Db,
  orgId: string,
  targetType: ActivityTarget,
  ids: string[],
) => {
  if (!ids.length) {
    return;
  }

  await client
    .delete(activities)
    .where(
      and(
        eq(activities.orgId, orgId),
        eq(activities.targetType, targetType),
        inArray(activities.targetId, ids),
      ),
    );
};

export const assertTarget = async (
  client: Db,
  orgId: string,
  targetType: ActivityTarget,
  targetId: string,
) => {
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

const CORE_TARGETS = new Set(['customer', 'company']);

/** The plugin timeline a target type belongs to (from installed plugins' manifests), or null. */
const pluginTimeline = async (client: Db, orgId: string, targetType: string) => {
  const [plugin] = targetType.split('.');

  const [row] = await client
    .select({ manifest: plugins.manifest })
    .from(plugins)
    .innerJoin(pluginInstallations, eq(pluginInstallations.plugin, plugins.name))
    .where(
      and(
        eq(plugins.name, plugin ?? ''),
        eq(plugins.status, 'active'),
        eq(pluginInstallations.orgId, orgId),
        eq(pluginInstallations.status, 'active'),
      ),
    )
    .limit(1);

  return row?.manifest?.timelines?.find((timeline) => timeline.type === targetType) ?? null;
};

/**
 * May this caller see (and note on) this timeline? Customers and companies
 * need `contacts.view` and must exist; a plugin's record type must be one an
 * installed plugin declared, with its permission (if any). Plugins reach
 * customers, companies and their own types.
 */
export const assertTimelineAccess = async (
  client: Db,
  who: { actor?: Actor | null; plugin?: PluginCaller | null; orgId: string },
  targetType: string,
  targetId: string,
) => {
  if (CORE_TARGETS.has(targetType)) {
    if (who.actor && !can(who.actor, 'contacts.view')) {
      throw new HttpError(403, 'NOT_ALLOWED', "Your role doesn't allow this", {
        permission: 'contacts.view',
      });
    }

    return assertTarget(client, who.orgId, targetType as ActivityTarget, targetId);
  }

  if (who.plugin && !targetType.startsWith(`${who.plugin.plugin}.`)) {
    throw new HttpError(
      403,
      'NOT_ALLOWED',
      'A plugin writes to customers, companies and its own record types only',
    );
  }

  const timeline = await pluginTimeline(client, who.orgId, targetType);

  if (!timeline)
    throw new HttpError(
      404,
      'NO_TIMELINE',
      `No installed plugin keeps a timeline for ${targetType}`,
    );

  if (who.actor && timeline.permission && !can(who.actor, timeline.permission)) {
    throw new HttpError(403, 'NOT_ALLOWED', "Your role doesn't allow this", {
      permission: timeline.permission,
    });
  }
};

export const listActivities = async (
  client: Db,
  actor: Actor,
  query: CursorQuery & {
    targetType: string;
    targetId: string;
    source?: string;
    kind?: 'all' | 'notes' | 'changes' | 'plugins';
    pinned?: boolean;
    includeRelated?: boolean;
    q?: string;
    actorId?: string;
    from?: string;
    to?: string;
  },
) => {
  await assertTimelineAccess(
    client,
    { actor, orgId: actor.orgId },
    query.targetType,
    query.targetId,
  );

  const text = query.q ? `%${query.q.replace(/[\\%_]/g, (char) => `\\${char}`)}%` : null;

  const own = and(
    eq(activities.targetType, query.targetType),
    eq(activities.targetId, query.targetId),
  );

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
              .where(
                and(
                  eq(customerCompanies.orgId, actor.orgId),
                  eq(customerCompanies.companyId, query.targetId),
                ),
              ),
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
      query.actorId ? eq(activities.actorId, query.actorId) : undefined,
      query.from ? sql`${activities.occurredAt} >= ${query.from}` : undefined,
      query.to ? sql`${activities.occurredAt} < ${query.to}` : undefined,
      text
        ? or(
            sql`${activities.summary} ilike ${text}`,
            sql`${activities.data} ->> 'body' ilike ${text}`,
            sql`${activities.data} ->> 'outcome' ilike ${text}`,
          )
        : undefined,
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

  // Who did each entry, in the same answer: the timeline reads at once
  // instead of waiting for the team list.
  const memberIds = unique(
    page.data.flatMap((row) => (row.actorType === 'user' && row.actorId ? [row.actorId] : [])),
  );

  const members = memberIds.length
    ? await client
        .select({
          id: users.id,
          name: sql<string>`coalesce(nullif(${users.fullName}, ''), ${users.email})`,
          avatarUrl: users.avatarUrl,
        })
        .from(users)
        .where(and(eq(users.orgId, actor.orgId), inArray(users.id, memberIds)))
    : [];

  const byId = new Map(members.map((member) => [member.id, member]));

  return {
    ...page,
    data: page.data.map((row) => {
      const dto = toActivityDto(row);
      const member = row.actorId ? byId.get(row.actorId) : undefined;

      return member && row.actorType === 'user'
        ? { ...dto, actor: { ...dto.actor, name: member.name, avatarUrl: member.avatarUrl } }
        : dto;
    }),
  };
};

// ─── Notes ──────────────────────────────────────────────────────────────────

/** Where a record lives in erxes (plugin records: their plugin opens them). */
const recordLink = (targetType: string, targetId: string) =>
  CORE_TARGETS.has(targetType)
    ? `/contacts/${targetType === 'customer' ? 'customers' : 'companies'}/${encodeURIComponent(targetId)}`
    : undefined;

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

  const editing =
    input.body !== undefined || input.mentions !== undefined || input.fileIds !== undefined;

  if (editing && note.actorId !== actor.userId) {
    throw new HttpError(403, 'NOT_AUTHOR', 'Only the author can edit a note');
  }

  const data = note.data as { body: string; mentions: string[]; fileIds: string[] };
  const mentions = input.mentions === undefined ? data.mentions : unique(input.mentions);

  for (const userId of mentions) await assertMember(client, actor.orgId, userId);

  const fileIds =
    input.fileIds === undefined
      ? data.fileIds
      : await checkFiles(client, actor.orgId, input.fileIds);

  const body = input.body ?? data.body;

  // Earlier wordings stay readable (the last 20).
  const history = [
    ...(((note.data as { history?: unknown[] }).history ?? []) as {
      body: string;
      editedAt: string;
    }[]),
    ...(input.body !== undefined && input.body !== data.body
      ? [{ body: data.body, editedAt: (note.editedAt ?? note.occurredAt).toISOString() }]
      : []),
  ].slice(-20);

  const reactions = (note.data as { reactions?: Record<string, string[]> }).reactions;

  return client.transaction(async (tx) => {
    const [row] = await tx
      .update(activities)
      .set({
        ...(editing
          ? {
              data: { body, mentions, fileIds, history, ...(reactions ? { reactions } : {}) },
              editedAt: sql`now()`,
            }
          : {}),
        ...(input.pinned !== undefined ? { pinnedAt: input.pinned ? sql`now()` : null } : {}),
      })
      .where(and(eq(activities.orgId, actor.orgId), eq(activities.id, id)))
      .returning();

    const added = mentions.filter((userId) => !data.mentions.includes(userId));

    await notifyMentions(
      tx,
      actor,
      { id, targetType: note.targetType, targetId: note.targetId, body },
      added,
    );

    return toActivityDto(row!);
  });
};

export const removeNote = async (client: Db, actor: Actor, id: string) => {
  const note = await findNote(client, actor.orgId, id);

  if (note.actorId !== actor.userId && !can(actor, 'notes.moderate')) {
    throw new HttpError(
      403,
      'NOT_ALLOWED',
      'Only the author or an owner or admin can delete a note',
    );
  }

  await client
    .delete(activities)
    .where(and(eq(activities.orgId, actor.orgId), eq(activities.id, id)));

  return { ok: true as const };
};

/**
 * A plugin event on a record someone owns reaches the owner's inbox for that
 * plugin (muting the plugin mutes these too).
 */
const notifyTargetOwner = async (
  client: Db,
  caller: PluginCaller,
  input: ActivityInput,
  activity: ActivityRow,
) => {
  if (!CORE_TARGETS.has(input.targetType)) return;

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
    link:
      input.link ??
      `/contacts/${input.targetType === 'customer' ? 'customers' : 'companies'}/${input.targetId}`,
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
export const createPluginActivity = async (
  client: Db,
  caller: PluginCaller,
  input: ActivityInput,
) => {
  assertPluginNamespace(caller.plugin, input.type);
  await assertTimelineAccess(
    client,
    { plugin: caller, orgId: caller.orgId },
    input.targetType,
    input.targetId,
  );
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

// ─── Reactions, plugin edits, types ─────────────────────────────────────────

/** Adds or takes back the member's reaction (row locked: two at once both count). */
export const reactToActivity = async (client: Db, actor: Actor, id: string, emoji: string) =>
  client.transaction(async (tx) => {
    const [row] = await tx
      .select()
      .from(activities)
      .where(and(eq(activities.orgId, actor.orgId), eq(activities.id, id)))
      .for('update')
      .limit(1);

    if (!row) throw notFound('Entry');

    await assertTimelineAccess(tx, { actor, orgId: actor.orgId }, row.targetType, row.targetId);

    const reactions = {
      ...(row.data as { reactions?: Record<string, string[]> }).reactions,
    };

    const people = new Set(reactions[emoji] ?? []);

    if (people.has(actor.userId)) people.delete(actor.userId);
    else {
      if (!reactions[emoji] && Object.keys(reactions).length >= 20)
        throw new HttpError(400, 'TOO_MANY_REACTIONS', 'At most 20 different reactions');
      people.add(actor.userId);
    }

    if (people.size) reactions[emoji] = [...people];
    else delete reactions[emoji];

    const [saved] = await tx
      .update(activities)
      .set({ data: { ...row.data, reactions } })
      .where(eq(activities.id, id))
      .returning();

    return toActivityDto(saved!);
  });

/** A plugin's own entry, by id or by `key:<dedupeKey>`. */
const pluginEntry = async (client: Db, caller: PluginCaller, ref: string) => {
  const [row] = await client
    .select()
    .from(activities)
    .where(
      and(
        eq(activities.orgId, caller.orgId),
        eq(activities.source, caller.plugin),
        ref.startsWith('key:') ? eq(activities.dedupeKey, ref.slice(4)) : eq(activities.id, ref),
      ),
    )
    .limit(1);

  if (!row) throw notFound('Entry');

  return row;
};

/** The order was refunded, the line changes: a plugin updates its own entry. */
export const updatePluginActivity = async (
  client: Db,
  caller: PluginCaller,
  ref: string,
  input: { summary?: string; data?: Record<string, unknown>; link?: string | null },
) => {
  const row = await pluginEntry(client, caller, ref);
  const reactions = (row.data as { reactions?: unknown }).reactions;

  const [saved] = await client
    .update(activities)
    .set({
      ...(input.summary !== undefined ? { summary: input.summary } : {}),
      ...(input.data !== undefined
        ? { data: { ...input.data, ...(reactions ? { reactions } : {}) } }
        : {}),
      ...(input.link !== undefined ? { link: input.link } : {}),
      editedAt: sql`now()`,
    })
    .where(eq(activities.id, row.id))
    .returning();

  return toActivityDto(saved!);
};

export const removePluginActivity = async (client: Db, caller: PluginCaller, ref: string) => {
  const row = await pluginEntry(client, caller, ref);

  await guardDeletions(client, pluginCaller(caller), 1, 'timeline entries');

  await client.delete(activities).where(eq(activities.id, row.id));

  return { ok: true as const };
};

const CORE_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  note: { label: 'Note', icon: 'IconNote' },
  created: { label: 'Created', icon: 'IconCirclePlus' },
  updated: { label: 'Changed', icon: 'IconPencil' },
  tagged: { label: 'Tagged', icon: 'IconTag' },
  merged: { label: 'Merged', icon: 'IconArrowMerge' },
};

/** Entry types (with plugins' labels and icons) and plugins' record timelines. */
export const activityTypes = async (client: Db, orgId: string) => {
  const installed = await client
    .select({ name: plugins.name, manifest: plugins.manifest })
    .from(plugins)
    .innerJoin(pluginInstallations, eq(pluginInstallations.plugin, plugins.name))
    .where(
      and(
        eq(pluginInstallations.orgId, orgId),
        eq(pluginInstallations.status, 'active'),
        eq(plugins.status, 'active'),
      ),
    );

  return {
    types: [
      ...Object.entries(CORE_TYPE_LABELS).map(([type, info]) => ({
        type: `*.${type}`,
        label: info.label,
        source: 'core',
        icon: info.icon,
        color: null,
      })),
      ...installed.flatMap((plugin) =>
        (plugin.manifest?.activityTypes ?? []).map((item) => ({
          type: item.type,
          label: item.label,
          source: plugin.name,
          icon: item.icon ?? null,
          color: item.color ?? null,
        })),
      ),
    ],
    timelines: installed.flatMap((plugin) =>
      (plugin.manifest?.timelines ?? []).map((item) => ({
        type: item.type,
        label: item.label,
        source: plugin.name,
        permission: item.permission ?? null,
      })),
    ),
  };
};
