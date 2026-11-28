import type { TIMELINE_KINDS } from '@erxes/core-db/enums';
import type { CursorQuery } from '@erxes/core-contract';
import { activities, caller, customerCompanies, type Db, notes, reactions } from '@erxes/core-db';
import { and, eq, ilike, inArray, isNotNull, ne, not, or, type SQL, sql } from 'drizzle-orm';
import { can } from '~/http/access';
import { fail, notFound } from '~/http/errors';
import { allOf, anyOf } from '~/lib/conditions';
import { assertMembers } from '~/lib/guards';
import { keysetPage } from '~/lib/keyset';
import { visibleEntries } from '~/modules/dataExtensions/valueHistory';
import { installedPlugins } from '~/modules/plugins/installedPlugin';
import { entryById, selectEntries } from './activities.service';
import { assertTimelineAccess } from './timelineAccess';

/** What any list of timeline entries filters on. */
interface TimelineFilters extends CursorQuery {
  source?: string;
  kind?: (typeof TIMELINE_KINDS)[number];
  pinned?: boolean;
  q?: string;
  actorId?: string;
  from?: string;
  to?: string;
}

interface TimelineQuery extends TimelineFilters {
  targetType: string;
  targetId: string;
  includeRelated?: boolean;
}

/** The timeline's own entries; a company's can include what happened with its customers. */
const timelineScope = (client: Db, query: TimelineQuery): SQL => {
  const own = allOf(
    eq(activities.targetType, query.targetType),
    eq(activities.targetId, query.targetId),
  );

  if (!query.includeRelated || query.targetType !== 'company') return own;

  // The people as an array, worked out once: `IN (subquery)` under the OR became a hashed
  // subquery checked on every entry of the organisation; with an array each side of the OR
  // reads the timeline index.
  const people = client
    .select({ id: customerCompanies.customerId })
    .from(customerCompanies)
    .where(eq(customerCompanies.companyId, query.targetId));

  const related = allOf(
    eq(activities.targetType, 'customer'),
    sql`${activities.targetId} = any(array(${people}))`,
  );

  return anyOf(own, related);
};

/** Entries that are notes matching `where` (all notes without it). */
const notesWhere = (client: Db, where?: SQL) =>
  inArray(activities.id, client.select({ id: notes.id }).from(notes).where(where));

/** The filters the member chose: source, kind, pinned, who, when and text. */
const timelineFilters = (client: Db, query: TimelineFilters) => {
  const text = query.q ? `%${query.q.replace(/[\\%_]/g, (char) => `\\${char}`)}%` : null;

  const kinds = {
    all: undefined,
    notes: notesWhere(client),
    changes: and(eq(activities.source, 'core'), not(notesWhere(client))),
    plugins: ne(activities.source, 'core'),
  };

  return and(
    query.source ? eq(activities.source, query.source) : undefined,
    kinds[query.kind ?? 'all'],
    query.pinned ? notesWhere(client, isNotNull(notes.pinnedAt)) : undefined,
    query.actorId ? eq(activities.actorId, query.actorId) : undefined,
    query.from ? sql`${activities.occurredAt} >= ${query.from}` : undefined,
    query.to ? sql`${activities.occurredAt} < ${query.to}` : undefined,
    text
      ? or(
          ilike(activities.summary, text),
          notesWhere(client, ilike(notes.body, text)),
          sql`${activities.data} ->> 'outcome' ilike ${text}`,
        )
      : undefined,
  );
};

export const listActivities = async (client: Db, query: TimelineQuery) => {
  await assertTimelineAccess(client, query.targetType, query.targetId);

  const page = await keysetPage(
    client,
    {
      table: activities,
      id: activities.id,
      // Timeline order is when it happened, which a plugin may backdate.
      createdAt: activities.occurredAt,
      scope: timelineScope(client, query),
    },
    timelineFilters(client, query),
    query,
    (where, orderBy, limit) =>
      selectEntries(client)
        .where(where)
        .orderBy(...orderBy)
        .limit(limit),
  );

  return { ...page, data: await visibleEntries(client, page.data) };
};

/**
 * The timelines the member may read without asking a plugin about each record, as
 * `assertTimelineAccess` allows them: customers and companies with `contacts.view`, plugin
 * record types with their permission.
 */
const readableTimelines = async (client: Db) => {
  const who = caller('user');

  const pluginTypes = (await installedPlugins(client)).flatMap((plugin) =>
    (plugin.manifest?.timelines ?? [])
      .filter(
        (timeline) =>
          !timeline.recordAccess && (!timeline.permission || can(who, timeline.permission)),
      )
      .map((timeline) => timeline.type),
  );

  return [...(can(who, 'contacts.view') ? ['customer', 'company'] : []), ...pluginTypes];
};

/** What a team member did, across the timelines the caller may read, newest first. */
export const listMemberActivities = async (
  client: Db,
  { actorId, ...query }: TimelineFilters & { actorId: string },
) => {
  await assertMembers(client, [actorId]);

  const targetTypes = await readableTimelines(client);

  const page = await keysetPage(
    client,
    {
      table: activities,
      id: activities.id,
      createdAt: activities.occurredAt,
      scope: allOf(
        eq(activities.actorType, 'user'),
        eq(activities.actorId, actorId),
        inArray(activities.targetType, targetTypes),
      ),
    },
    timelineFilters(client, query),
    query,
    (where, orderBy, limit) =>
      selectEntries(client)
        .where(where)
        .orderBy(...orderBy)
        .limit(limit),
  );

  return { ...page, data: await visibleEntries(client, page.data) };
};

/**
 * Adds or takes back the member's reaction. The entry is locked, so two at
 * once both count and the limit of 20 emoji holds.
 */
export const reactToActivity = async (client: Db, id: string, emoji: string) => {
  const { userId } = caller('user');

  const [row] = await client
    .select({ targetType: activities.targetType, targetId: activities.targetId })
    .from(activities)
    .where(eq(activities.id, id))
    .for('update')
    .limit(1);

  if (!row) throw notFound('Entry');

  await assertTimelineAccess(client, row.targetType, row.targetId);

  const taken = await client
    .delete(reactions)
    .where(
      and(eq(reactions.activityId, id), eq(reactions.emoji, emoji), eq(reactions.userId, userId)),
    )
    .returning({ emoji: reactions.emoji });

  if (!taken.length) {
    const used = await client
      .selectDistinct({ emoji: reactions.emoji })
      .from(reactions)
      .where(eq(reactions.activityId, id));

    if (used.length >= 20 && !used.some((one) => one.emoji === emoji))
      throw fail('TOO_MANY_REACTIONS', 'At most 20 different reactions');

    await client.insert(reactions).values({ activityId: id, userId, emoji });
  }

  return entryById(client, id);
};

const CORE_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  note: { label: 'Note', icon: 'IconNote' },
  created: { label: 'Created', icon: 'IconCirclePlus' },
  updated: { label: 'Changed', icon: 'IconPencil' },
  tagged: { label: 'Tagged', icon: 'IconTag' },
  merged: { label: 'Merged', icon: 'IconArrowMerge' },
};

/** Entry types (with plugins' labels and icons) and plugins' record timelines. */
export const activityTypes = async (client: Db) => {
  const installed = await installedPlugins(client);

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
