import type { CursorQuery } from '@erxes/core-contract';
import {
  type Db,
  emailAddresses,
  emailDeliveries,
  newId,
  type SuppressionReason,
  suppressions,
} from '@erxes/core-db';
import type { EMAIL_LANES } from '@erxes/core-db/emailEnums';
import { textArray } from '@erxes/plugin-sdk/filter';
import { and, eq, ilike, inArray, ne, type SQL, type SQLWrapper, sql } from 'drizzle-orm';
import { containsPattern, keysetPage } from '~/lib/keyset';

export type EmailLane = (typeof EMAIL_LANES)[number];

/**
 * How long a delivery the provider reported proves an address: a mailbox
 * abandoned since may bounce now, so an older one stands as unknown again.
 */
const PROVEN_DAYS = 180;

/** `suppressed` with any suppression, else `proven` with a recent delivery, else `unknown`. */
const laneSql = (suppressionId: SQLWrapper, lastDeliveredAt: SQLWrapper) =>
  sql<EmailLane>`case
    when ${suppressionId} is not null then 'suppressed'
    when ${lastDeliveredAt} > now() - make_interval(days => ${PROVEN_DAYS}) then 'proven'
    else 'unknown' end`;

/**
 * Sign-in emails (`sources`) sent in the last hour to addresses no recent
 * delivery proves, not counting those the cap or a suppression stopped.
 */
export const unprovenSentLastHour = async (client: Db, sources: readonly string[]) => {
  const { rows } = await client.execute<{ count: number }>(sql`
    select count(*)::int as count from ${emailDeliveries} d
    where d.source = any(${textArray([...sources])})
      and d.created_at > now() - interval '1 hour'
      and d.status <> all(${textArray(['capped', 'suppressed'])})
      and not exists (
        select 1 from ${emailAddresses} a
        where a.email = d."to" and a.last_delivered_at > now() - make_interval(days => ${PROVEN_DAYS}))`);

  return rows[0]?.count ?? 0;
};

/**
 * Counts the emails the provider took, one upsert for a block of copies, so
 * an address shows from its first email; only a reported delivery proves it.
 */
export const recordSent = async (client: Db, emails: string[]) => {
  const counts = new Map<string, number>();

  for (const email of emails) {
    const address = email.toLowerCase();

    counts.set(address, (counts.get(address) ?? 0) + 1);
  }

  if (!counts.size) return;

  const now = new Date();

  await client
    .insert(emailAddresses)
    .values(
      [...counts].map(([email, sentCount]) => ({ id: newId(), email, sentCount, lastSentAt: now })),
    )
    .onConflictDoUpdate({
      target: [emailAddresses.orgId, emailAddresses.email],
      set: {
        sentCount: sql`${emailAddresses.sentCount} + excluded.sent_count`,
        lastSentAt: now,
        updatedAt: now,
      },
    });
};

/**
 * Each address's standing in the scope's organisation, in one query (up to
 * a few hundred at a time); every address given is in the answer, lower-cased.
 */
export const laneOf = async (client: Db, emails: string[]): Promise<Map<string, EmailLane>> => {
  const addresses = [...new Set(emails.map((email) => email.toLowerCase()))];

  if (!addresses.length) return new Map();

  const { rows } = await client.execute<{ email: string; lane: EmailLane }>(sql`
    select e.email, ${laneSql(sql`s.id`, sql`a.last_delivered_at`)} as lane
    from unnest(${textArray(addresses)}) as e(email)
    left join ${emailAddresses} a on a.email = e.email
    left join ${suppressions} s on s.channel = 'email' and s.address = e.email`);

  return new Map(rows.map((row) => [row.email, row.lane]));
};

/**
 * The addresses among `emails` that may not get this email, with the reason,
 * lower-cased. A bounce, a complaint or a member's entry stops every email,
 * a password reset too; an unsubscribe stops only `marketing` (broadcasts).
 */
export const suppressedOf = async (client: Db, emails: string[], marketing: boolean) => {
  const addresses = [...new Set(emails.map((email) => email.toLowerCase()))];

  if (!addresses.length) return new Map<string, SuppressionReason>();

  const rows = await client
    .select({ address: suppressions.address, reason: suppressions.reason })
    .from(suppressions)
    .where(
      and(
        eq(suppressions.channel, 'email'),
        inArray(suppressions.address, addresses),
        marketing ? undefined : ne(suppressions.reason, 'unsubscribed'),
      ),
    );

  return new Map(rows.map((row) => [row.address, row.reason]));
};

/**
 * Every address with a record or an email suppression, one row each: the
 * record's counts and the suppression's reason side by side. Sorted when read;
 * an organisation has as many rows as addresses it emailed.
 */
const standings = (client: Db) => {
  const emailSuppressions = client
    .select({
      id: sql<string>`${suppressions.id}`.as('suppression_id'),
      address: suppressions.address,
      reason: sql<SuppressionReason>`${suppressions.reason}`.as('suppression_reason'),
      detail: sql<string | null>`${suppressions.detail}`.as('suppression_detail'),
      createdAt: sql`${suppressions.createdAt}`.mapWith(suppressions.createdAt).as('suppressed_at'),
    })
    .from(suppressions)
    .where(eq(suppressions.channel, 'email'))
    .as('s');

  return client
    .select({
      id: sql<string>`coalesce(${emailAddresses.id}, ${emailSuppressions.id})`.as('id'),
      email: sql<string>`coalesce(${emailAddresses.email}, ${emailSuppressions.address})`.as(
        'email',
      ),
      sentCount: sql<number>`coalesce(${emailAddresses.sentCount}, 0)`
        .mapWith(Number)
        .as('sent_count'),
      lastSentAt: sql<Date | null>`${emailAddresses.lastSentAt}`
        .mapWith(emailAddresses.lastSentAt)
        .as('last_sent_at'),
      deliveredCount: sql<number>`coalesce(${emailAddresses.deliveredCount}, 0)`
        .mapWith(Number)
        .as('delivered_count'),
      lastDeliveredAt: sql<Date | null>`${emailAddresses.lastDeliveredAt}`
        .mapWith(emailAddresses.lastDeliveredAt)
        .as('last_delivered_at'),
      softBounces: sql<number>`coalesce(${emailAddresses.softBounces}, 0)`
        .mapWith(Number)
        .as('soft_bounces'),
      lastBouncedAt: sql<Date | null>`${emailAddresses.lastBouncedAt}`
        .mapWith(emailAddresses.lastBouncedAt)
        .as('last_bounced_at'),
      createdAt: sql<Date>`least(${emailAddresses.createdAt}, ${emailSuppressions.createdAt})`
        .mapWith(emailAddresses.createdAt)
        .as('created_at'),
      lane: laneSql(emailSuppressions.id, emailAddresses.lastDeliveredAt).as('lane'),
      suppressionId: emailSuppressions.id,
      suppressionReason: emailSuppressions.reason,
      suppressionDetail: emailSuppressions.detail,
      suppressedAt: emailSuppressions.createdAt,
    })
    .from(emailAddresses)
    .fullJoin(emailSuppressions, eq(emailSuppressions.address, emailAddresses.email))
    .as('standing');
};

/** Addresses and their standing, newest first (Settings › Integrations › Email sending › Addresses). */
export const listAddresses = (
  client: Db,
  query: CursorQuery & { lane?: EmailLane; search?: string },
) => {
  const standing = standings(client);

  const filters: (SQL | undefined)[] = [
    query.lane ? eq(standing.lane, query.lane) : undefined,
    query.search ? ilike(standing.email, containsPattern(query.search)) : undefined,
  ];

  return keysetPage(
    client,
    { table: standing, id: standing.id, createdAt: standing.createdAt },
    and(...filters),
    query,
    (where, orderBy, limit) =>
      client
        .select()
        .from(standing)
        .where(where)
        .orderBy(...orderBy)
        .limit(limit),
  );
};
