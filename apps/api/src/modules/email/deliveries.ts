import type { CursorQuery } from '@erxes/core-contract';
import {
  type EMAIL_DELIVERY_PROVIDERS,
  type EMAIL_DELIVERY_STATUSES,
  EMAIL_REPORTED_STATUSES,
  type EMAIL_SOURCES,
} from '@erxes/core-db/emailEnums';
import {
  type Db,
  emailDeliveries,
  runAs,
  type SuppressionReason,
  system,
  withOrg,
} from '@erxes/core-db';
import { and, eq, ilike, inArray, sql } from 'drizzle-orm';
import { containsPattern, keysetPage } from '~/lib/keyset';
import { inOrder } from '~/lib/sequence';
import { recordActivity } from '~/modules/activities/record';
import { recordSent, suppressedOf } from './addresses';
import { admitEmails, countSent, type RampHold } from './ramp';

type EmailSource = (typeof EMAIL_SOURCES)[number];

type EmailDeliveryStatus = (typeof EMAIL_DELIVERY_STATUSES)[number];

type DeliveryProvider = (typeof EMAIL_DELIVERY_PROVIDERS)[number];

/** What an email was for, and the record it came from. */
export interface EmailOrigin {
  source: EmailSource;
  sourceId?: string | null;
}

/** How long the log keeps an email. */
const KEEP_DAYS = 90;

type DeliveryRow = typeof emailDeliveries.$inferSelect;

/**
 * A settled email to a known customer goes on that customer's timeline
 * (`customer.emailed`), sent or failed, as core's system did it; a bounce or
 * complaint the provider reports later adds another.
 */
export const onTimelines = (client: Db, rows: DeliveryRow[]) =>
  runAs(system('email sent'), () =>
    recordActivity(
      client,
      rows.flatMap((row) =>
        row.customerId && row.status !== 'queued' && row.status !== 'held'
          ? [
              {
                targetType: 'customer' as const,
                targetId: row.customerId,
                type: 'customer.emailed',
                data: {
                  deliveryId: row.id,
                  subject: row.subject,
                  source: row.source,
                  sourceId: row.sourceId,
                  status: row.status,
                  error: row.error,
                },
              },
            ]
          : [],
      ),
    ),
  );

/** An email as the sender knows it: the customer it goes to, when there is one. */
interface Addressed {
  to: string;
  subject: string;
  customerId?: string | null;
}

/** An email not queued now: its address is suppressed, or the sending ramp holds or caps it. */
export type DeliveryHold = { status: 'suppressed'; reason: SuppressionReason } | RampHold;

/**
 * Rows for emails about to be queued, in the caller's transaction: each id
 * goes with its job. Every email passes here (`sendEmail`, a broadcast's
 * copies), so here a suppressed address is held back: from a broadcast
 * (marketing) for any reason; from every other email (an invitation, a
 * password reset, a sign-in code, a plugin's or an automation's) for a
 * bounce, a complaint or a member's entry, not for an unsubscribe. Its row
 * says `suppressed`, the reason in `error`, and goes on the customer's
 * timeline. The rest pass the sending ramp (`ramp.ts`), which counts them
 * and may hold them (`held`: their job waits until `until`) or cap them.
 * Answers the ids not queued now, with why: the caller sends the rest.
 */
export const queueDeliveries = async (
  client: Db,
  origin: EmailOrigin,
  emails: (Addressed & { id: string })[],
) => {
  const holds = new Map<string, DeliveryHold>();

  if (!emails.length) return holds;

  const blocked = await suppressedOf(
    client,
    emails.map((email) => email.to),
    origin.source === 'broadcast',
  );

  for (const email of emails) {
    const reason = blocked.get(email.to.toLowerCase());

    if (reason) holds.set(email.id, { status: 'suppressed', reason });
  }

  const ramped = await admitEmails(
    client,
    origin.source,
    emails.filter((email) => !holds.has(email.id)),
  );

  for (const [id, hold] of ramped) holds.set(id, hold);

  const rows = await client
    .insert(emailDeliveries)
    .values(
      emails.map((email) => ({
        id: email.id,
        source: origin.source,
        sourceId: origin.sourceId ?? null,
        to: email.to.toLowerCase(),
        customerId: email.customerId ?? null,
        subject: email.subject.slice(0, 300),
        status: holds.get(email.id)?.status ?? ('queued' as const),
        error: holds.get(email.id)?.reason ?? null,
      })),
    )
    .returning();

  await onTimelines(
    client,
    rows.filter((row) => row.status === 'suppressed' || row.status === 'capped'),
  );

  return holds;
};

/** One try of a queued email: sent, or refused (`final`: no retry follows). */
export type EmailTry = { provider: DeliveryProvider | null } & (
  | { sent: true }
  | { sent: false; error: string; final: boolean }
);

/** What the provider's events already told stays: a fast event can beat the try's own settling. */
const REPORTED = inArray(emailDeliveries.status, [...EMAIL_REPORTED_STATUSES]);

const settledValues = (outcome: EmailTry) =>
  outcome.sent
    ? {
        status: sql`case when ${REPORTED} then ${emailDeliveries.status} else 'sent' end`,
        error: null,
        sentAt: new Date(),
      }
    : {
        status: outcome.final ? ('failed' as const) : ('queued' as const),
        error: outcome.error.slice(0, 2000),
      };

/**
 * Settles tries of queued emails in the caller's transaction, one update for
 * each outcome alike (a block of broadcast copies is mostly sent).
 */
export const settleTries = async (client: Db, tries: (EmailTry & { id: string })[]) => {
  const keyOf = ({ id: _id, ...outcome }: EmailTry & { id: string }) => JSON.stringify(outcome);
  const settled: DeliveryRow[] = [];

  await inOrder(new Set(tries.map(keyOf)), async (key) => {
    const group = tries.filter((item) => keyOf(item) === key);
    const [first] = group;

    if (!first) return;

    const rows = await client
      .update(emailDeliveries)
      .set({
        attempts: sql`${emailDeliveries.attempts} + 1`,
        provider: first.provider,
        updatedAt: new Date(),
        ...settledValues(first),
      })
      .where(
        inArray(
          emailDeliveries.id,
          group.map(({ id }) => id),
        ),
      )
      .returning();

    settled.push(...rows);

    if (first.sent)
      await recordSent(
        client,
        rows.map((row) => row.to),
      );
  });

  await onTimelines(client, settled);
};

/** Its own short transaction, after the job's try; never fails the job. */
export const settleDelivery = (orgId: string, id: string, outcome: EmailTry) =>
  withOrg(orgId, (tx) => settleTries(tx, [{ id, ...outcome }]));

/**
 * Rows of copies that never reached the server (a slow-down or the ramp sent
 * them back): the next try gets new ones. Those the ramp had counted come
 * off today's count.
 */
export const dropDeliveries = async (client: Db, ids: string[]) => {
  if (!ids.length) return;

  const dropped = await client
    .delete(emailDeliveries)
    .where(inArray(emailDeliveries.id, ids))
    .returning({ status: emailDeliveries.status });

  await countSent(client, -dropped.filter((row) => row.status === 'queued').length);
};

export const listDeliveries = (
  client: Db,
  query: CursorQuery & {
    status?: EmailDeliveryStatus;
    source?: EmailSource;
    sourceId?: string;
    search?: string;
  },
) =>
  keysetPage(
    client,
    { table: emailDeliveries, id: emailDeliveries.id, createdAt: emailDeliveries.createdAt },
    and(
      query.status ? eq(emailDeliveries.status, query.status) : undefined,
      query.source ? eq(emailDeliveries.source, query.source) : undefined,
      query.sourceId ? eq(emailDeliveries.sourceId, query.sourceId) : undefined,
      query.search ? ilike(emailDeliveries.to, containsPattern(query.search)) : undefined,
    ),
    query,
    (where, orderBy, limit) =>
      client
        .select()
        .from(emailDeliveries)
        .where(where)
        .orderBy(...orderBy)
        .limit(limit),
  );

/** Older than `KEEP_DAYS`, 10 000 a run (the hourly cleanup, across organisations). */
export const pruneEmailDeliveries = async (client: Db) => {
  const result = await client.execute(sql`
    delete from ${emailDeliveries} where id in (
      select id from ${emailDeliveries}
      where created_at < now() - make_interval(days => ${KEEP_DAYS}) limit 10000
    )
  `);

  return result.rowCount ?? 0;
};
