import type { BroadcastStats, CursorQuery } from '@erxes/core-contract';
import {
  type BroadcastStatus,
  broadcastRecipients,
  broadcasts,
  callerUserId,
  customers,
  type Db,
  newId,
  organizations,
} from '@erxes/core-db';
import { and, eq, getTableColumns, ilike, inArray, sql } from 'drizzle-orm';
import { fail, notFound } from '~/http/errors';
import { containsPattern, keysetPage } from '~/lib/keyset';
import { type Audience, audienceWhere, estimateAudience } from './audience';
import { assertPlaceholders, type PlaceholderValues } from './placeholders';

type BroadcastRow = typeof broadcasts.$inferSelect;

/**
 * The outer broadcast's id, table and all: in a one-table select Drizzle
 * writes `${broadcasts.id}` as a bare `"id"`, which inside the subquery would
 * be the recipient's own.
 */
export const outerId = sql`${broadcasts}.${sql.identifier('id')}`;

/** A broadcast's recipients counted by what became of them, in one subquery per broadcast. */
const stats = sql<BroadcastStats>`(select json_build_object(
    'queued', count(*) filter (where r.status = 'queued'),
    'sending', count(*) filter (where r.status = 'sending'),
    'sent', count(*) filter (where r.status = 'sent'),
    'failed', count(*) filter (where r.status = 'failed'),
    'skipped', count(*) filter (where r.status = 'skipped'),
    'opened', count(r.opened_at),
    'clicked', count(r.clicked_at),
    'unsubscribed', count(r.unsubscribed_at))
  from ${broadcastRecipients} r where r.broadcast_id = ${outerId})`;

const selectBroadcasts = (client: Db) =>
  client.select({ ...getTableColumns(broadcasts), stats }).from(broadcasts);

export const getBroadcast = async (client: Db, id: string) => {
  const [row] = await selectBroadcasts(client).where(eq(broadcasts.id, id)).limit(1);

  if (!row) throw notFound('Broadcast');

  return row;
};

export const listBroadcasts = (
  client: Db,
  query: CursorQuery & {
    status?: BroadcastStatus;
    channel?: BroadcastRow['channel'];
    search?: string;
  },
) =>
  keysetPage(
    client,
    { table: broadcasts, id: broadcasts.id, createdAt: broadcasts.createdAt },
    and(
      query.status ? eq(broadcasts.status, query.status) : undefined,
      query.channel ? eq(broadcasts.channel, query.channel) : undefined,
      query.search ? ilike(broadcasts.name, containsPattern(query.search)) : undefined,
    ),
    query,
    (where, orderBy, limit) =>
      selectBroadcasts(client)
        .where(where)
        .orderBy(...orderBy)
        .limit(limit),
  );

interface Content {
  subject?: string | null;
  preheader?: string | null;
  body?: string;
}

/** Placeholders must be ones erxes fills; the audience must compile (a view of people, a valid filter). */
const assertWritable = async (client: Db, content: Content, audience: Audience) => {
  assertPlaceholders(content.subject, content.preheader, content.body);
  await audienceWhere(client, audience);
};

export const createBroadcast = async (
  client: Db,
  input: Content &
    Audience & {
      name: string;
      channel: BroadcastRow['channel'];
      fromName?: string | null;
      replyTo?: string | null;
    },
) => {
  await assertWritable(client, input, input);

  const id = newId();

  await client.insert(broadcasts).values({ ...input, id, createdBy: callerUserId() });

  return getBroadcast(client, id);
};

/**
 * Moves a broadcast from one of `from` to `to` (with `set`) in one
 * conditional update, so two members acting at once can't both move it.
 * 404 when it doesn't exist, 409 BROADCAST_STATUS when it stands elsewhere.
 */
export const moveBroadcast = async (
  client: Db,
  id: string,
  from: readonly BroadcastStatus[],
  set: Partial<typeof broadcasts.$inferInsert>,
) => {
  const moved = await client
    .update(broadcasts)
    .set({ ...set, updatedAt: new Date() })
    .where(and(eq(broadcasts.id, id), inArray(broadcasts.status, [...from])))
    .returning({ id: broadcasts.id });

  if (moved.length) return;

  const [current] = await client
    .select({ status: broadcasts.status })
    .from(broadcasts)
    .where(eq(broadcasts.id, id))
    .limit(1);

  if (!current) throw notFound('Broadcast');

  throw fail('BROADCAST_STATUS', `The broadcast is ${current.status}`, {
    status: current.status,
  });
};

/** Before sending starts. */
const EDITABLE = ['draft', 'scheduled'] as const;

export const updateBroadcast = async (
  client: Db,
  id: string,
  changes: Content &
    Audience & { name?: string; fromName?: string | null; replyTo?: string | null },
) => {
  const current = await getBroadcast(client, id);

  await assertWritable(
    client,
    {
      subject: changes.subject === undefined ? current.subject : changes.subject,
      preheader: changes.preheader === undefined ? current.preheader : changes.preheader,
      body: changes.body ?? current.body,
    },
    {
      viewId: changes.viewId === undefined ? current.viewId : changes.viewId,
      filter: changes.filter === undefined ? current.filter : changes.filter,
    },
  );

  // A view and a filter don't go together: setting one clears the other.
  const audience = changes.viewId ? { filter: null } : changes.filter ? { viewId: null } : {};

  await moveBroadcast(client, id, EDITABLE, { ...changes, ...audience });

  return getBroadcast(client, id);
};

/** Not while it goes out: pause or cancel first. */
export const removeBroadcast = async (client: Db, id: string) => {
  const deleted = await client
    .delete(broadcasts)
    .where(
      and(
        eq(broadcasts.id, id),
        inArray(broadcasts.status, ['draft', 'scheduled', 'sent', 'cancelled', 'failed']),
      ),
    )
    .returning({ name: broadcasts.name });

  if (deleted[0]) return deleted[0];

  const { status } = await getBroadcast(client, id);

  throw fail('BROADCAST_STATUS', `The broadcast is ${status}: cancel it first`, { status });
};

export const duplicateBroadcast = async (client: Db, id: string) => {
  const source = await getBroadcast(client, id);
  const copy = newId();

  await client.insert(broadcasts).values({
    id: copy,
    name: `${source.name} (copy)`.slice(0, 120),
    channel: source.channel,
    viewId: source.viewId,
    filter: source.filter,
    subject: source.subject,
    preheader: source.preheader,
    body: source.body,
    fromName: source.fromName,
    replyTo: source.replyTo,
    createdBy: callerUserId(),
  });

  return getBroadcast(client, copy);
};

/** What sending needs and the broadcast lacks: `subject` (email), `body`. */
export const missingContent = (broadcast: BroadcastRow) => [
  ...(broadcast.channel === 'email' && !broadcast.subject?.trim() ? ['subject'] : []),
  ...(!broadcast.body.trim() ? ['body'] : []),
];

/** 400 BROADCAST_INCOMPLETE naming what sending needs and the broadcast lacks. */
export const assertComplete = (broadcast: BroadcastRow) => {
  const missing = missingContent(broadcast);

  if (missing.length) {
    throw fail('BROADCAST_INCOMPLETE', `Add ${missing.join(' and ')} before sending`, {
      missing,
    });
  }
};

/** 409 NO_RECIPIENTS when the audience reaches nobody on the channel now. */
export const assertReachable = async (client: Db, broadcast: BroadcastRow) => {
  const { reachable } = await estimateAudience(client, broadcast.channel, broadcast);

  if (!reachable) {
    throw fail(
      'NO_RECIPIENTS',
      `Nobody in the audience has a ${broadcast.channel === 'email' ? 'email address' : 'phone'} that can be reached`,
    );
  }
};

/** The scope's organisation's name, for `{{ organization }}` and the footer. */
export const organizationName = async (client: Db) => {
  const [organization] = await client
    .select({ name: organizations.name })
    .from(organizations)
    .limit(1);

  return organization?.name ?? 'erxes';
};

/** Placeholder values for customers, by id. */
export const valuesOf = async (client: Db, customerIds: string[], organization: string) => {
  if (!customerIds.length) return new Map<string, PlaceholderValues>();

  const rows = await client
    .select({
      id: customers.id,
      firstName: customers.firstName,
      lastName: customers.lastName,
      email: customers.primaryEmail,
      phone: customers.primaryPhone,
      code: customers.code,
      position: customers.position,
    })
    .from(customers)
    .where(inArray(customers.id, customerIds));

  return new Map(rows.map(({ id, ...values }) => [id, { ...values, organization }]));
};
