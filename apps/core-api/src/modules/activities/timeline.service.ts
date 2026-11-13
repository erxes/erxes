import type { TIMELINE_KINDS } from '@erxes/core-db/enums';
import type { CursorQuery } from '@erxes/core-contract';
import {
  activities,
  customerCompanies,
  type Db,
  pluginInstallations,
  plugins,
  users,
} from '@erxes/core-db';
import { and, eq, inArray, isNotNull, ne, notLike, or, type SQL, sql } from 'drizzle-orm';
import type { Actor } from '~/http/auth';
import { HttpError, notFound } from '~/http/errors';
import { allOf, anyOf } from '~/lib/conditions';
import { unique } from '~/lib/contacts';
import { keysetPage } from '~/lib/keyset';
import { oneRow } from '~/lib/rows';
import { isNote, reactionsOf, toActivityDto } from './activities.service';
import { assertTimelineAccess } from './timelineAccess';

interface TimelineQuery extends CursorQuery {
  targetType: string;
  targetId: string;
  source?: string;
  kind?: (typeof TIMELINE_KINDS)[number];
  pinned?: boolean;
  includeRelated?: boolean;
  q?: string;
  actorId?: string;
  from?: string;
  to?: string;
}

/** The timeline's own entries; a company's can include what happened with its customers. */
const timelineScope = (client: Db, query: TimelineQuery): SQL => {
  const own = allOf(
    eq(activities.targetType, query.targetType),
    eq(activities.targetId, query.targetId),
  );

  if (!query.includeRelated || query.targetType !== 'company') return own;

  const related = allOf(
    eq(activities.targetType, 'customer'),
    inArray(
      activities.targetId,
      client
        .select({ id: customerCompanies.customerId })
        .from(customerCompanies)
        .where(eq(customerCompanies.companyId, query.targetId)),
    ),
  );

  return anyOf(own, related);
};

const KIND_FILTERS = {
  all: undefined,
  notes: isNote,
  changes: and(eq(activities.source, 'core'), notLike(activities.type, '%.note')),
  plugins: ne(activities.source, 'core'),
};

/** The filters the member chose: source, kind, pinned, who, when and text. */
const timelineFilters = (query: TimelineQuery) => {
  const text = query.q ? `%${query.q.replace(/[\\%_]/g, (char) => `\\${char}`)}%` : null;

  return and(
    query.source ? eq(activities.source, query.source) : undefined,
    KIND_FILTERS[query.kind ?? 'all'],
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
  );
};

/** Names and avatars of the members behind the entries. */
const membersOf = async (client: Db, memberIds: string[]) => {
  const members = memberIds.length
    ? await client
        .select({
          id: users.id,
          name: sql<string>`coalesce(nullif(${users.fullName}, ''), ${users.email})`,
          avatarUrl: users.avatarUrl,
        })
        .from(users)
        .where(inArray(users.id, memberIds))
    : [];

  return new Map(members.map((member) => [member.id, member]));
};

export const listActivities = async (client: Db, actor: Actor, query: TimelineQuery) => {
  await assertTimelineAccess(
    client,
    { actor, orgId: actor.orgId },
    query.targetType,
    query.targetId,
  );

  const page = await keysetPage(
    client,
    {
      table: activities,
      id: activities.id,
      // Timeline order is when it happened, which a plugin may backdate.
      createdAt: activities.occurredAt,
      scope: timelineScope(client, query),
    },
    timelineFilters(query),
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
  const byId = await membersOf(
    client,
    unique(
      page.data.flatMap((row) => (row.actorType === 'user' && row.actorId ? [row.actorId] : [])),
    ),
  );

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

/** Adds or takes back the member's reaction (row locked: two at once both count). */
export const reactToActivity = async (client: Db, actor: Actor, id: string, emoji: string) => {
  const [row] = await client
    .select()
    .from(activities)
    .where(eq(activities.id, id))
    .for('update')
    .limit(1);

  if (!row) throw notFound('Entry');

  await assertTimelineAccess(client, { actor, orgId: actor.orgId }, row.targetType, row.targetId);

  const reactions = { ...reactionsOf(row.data) };
  const people = new Set(reactions[emoji] ?? []);

  if (people.has(actor.userId)) people.delete(actor.userId);
  else {
    if (!reactions[emoji] && Object.keys(reactions).length >= 20)
      throw new HttpError(400, 'TOO_MANY_REACTIONS', 'At most 20 different reactions');
    people.add(actor.userId);
  }

  if (people.size) reactions[emoji] = [...people];
  else delete reactions[emoji];

  const saved = oneRow(
    await client
      .update(activities)
      .set({ data: { ...row.data, reactions } })
      .where(eq(activities.id, id))
      .returning(),
  );

  return toActivityDto(saved);
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
  const installed = await client
    .select({ name: plugins.name, manifest: plugins.manifest })
    .from(plugins)
    .innerJoin(pluginInstallations, eq(pluginInstallations.plugin, plugins.name))
    .where(and(eq(pluginInstallations.status, 'active'), eq(plugins.status, 'active')));

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
