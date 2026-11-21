import {
  broadcasts,
  type Db,
  emailAddresses,
  emailDeliveries,
  newId,
  suppressions,
  withOrg,
} from '@erxes/core-db';
import { and, eq, inArray, sql } from 'drizzle-orm';
import type { EMAIL_REPORTED_STATUSES } from '@erxes/core-db/emailEnums';
import { inOrder } from '~/lib/sequence';
import { onTimelines } from '../deliveries';

/**
 * What one provider event says about one email, read from SendGrid's or SES's
 * own shape (`sendgrid.ts`, `ses.ts`) and tagged with the organisation and
 * the delivery row the email carried.
 */
export interface DeliveryEvent {
  orgId: string;
  deliveryId: string;
  /** When it happened, by the provider's clock. */
  at: Date;
  /** `deferred`: the recipient's server asked to try later; the provider keeps trying. */
  kind: Reported | 'deferred';
  /** A hard bounce, a drop or a complaint: the address gets no more email. */
  suppress: boolean;
  /** The server's words. */
  detail: string | null;
}

type Reported = (typeof EMAIL_REPORTED_STATUSES)[number];

/** The statuses each event may move a row from: a later event never moves it back. */
const MOVES_FROM = {
  delivered: ['queued', 'sent'],
  bounced: ['queued', 'sent', 'delivered'],
  complained: ['queued', 'sent', 'delivered', 'bounced'],
} as const satisfies Record<Reported, readonly string[]>;

type DeliveryRow = typeof emailDeliveries.$inferSelect;

/**
 * Keeps the address from every later email. A complaint replaces a bounce or
 * a member's entry (the person's own word); an unsubscribe stays as it is.
 */
const suppress = async (tx: Db, row: DeliveryRow, event: DeliveryEvent) => {
  const reason = event.kind === 'complained' ? 'complained' : 'bounced';

  // The broadcast it came from, while it still exists.
  const broadcastId =
    row.source === 'broadcast' && row.sourceId
      ? sql`(select ${broadcasts.id} from ${broadcasts} where ${broadcasts.id} = ${row.sourceId})`
      : null;

  const insert = tx.insert(suppressions).values({
    id: newId(),
    channel: 'email',
    address: row.to,
    reason,
    detail: event.detail?.slice(0, 1000) ?? null,
    broadcastId,
  });

  await (reason === 'complained'
    ? insert.onConflictDoUpdate({
        target: [suppressions.orgId, suppressions.channel, suppressions.address],
        set: { reason, detail: event.detail?.slice(0, 1000) ?? null },
        setWhere: inArray(suppressions.reason, ['bounced', 'manual']),
      })
    : insert.onConflictDoNothing());
};

/**
 * What the event tells about the address, in `core_email_addresses` (sends
 * are counted by `recordSent`): a delivery counts and clears the soft bounces; a deferral or a
 * bounce that doesn't suppress counts as a soft bounce; a hard bounce is only
 * dated, its suppression keeps the address from email. Only a provider's
 * event proves an address: an email the server merely took (SMTP, the log
 * driver) never does.
 */
const recordAddress = async (tx: Db, email: string, event: DeliveryEvent) => {
  if (event.kind === 'complained') return;

  const delivered = event.kind === 'delivered';
  const soft = event.kind === 'deferred' || (event.kind === 'bounced' && !event.suppress);

  await tx
    .insert(emailAddresses)
    .values({
      id: newId(),
      email: email.toLowerCase(),
      deliveredCount: delivered ? 1 : 0,
      lastDeliveredAt: delivered ? event.at : null,
      softBounces: soft ? 1 : 0,
      lastBouncedAt: delivered ? null : event.at,
    })
    .onConflictDoUpdate({
      target: [emailAddresses.orgId, emailAddresses.email],
      set: delivered
        ? {
            deliveredCount: sql`${emailAddresses.deliveredCount} + 1`,
            lastDeliveredAt: sql`greatest(${emailAddresses.lastDeliveredAt}, excluded.last_delivered_at)`,
            softBounces: 0,
            updatedAt: new Date(),
          }
        : {
            softBounces: sql`${emailAddresses.softBounces} + excluded.soft_bounces`,
            lastBouncedAt: sql`greatest(${emailAddresses.lastBouncedAt}, excluded.last_bounced_at)`,
            updatedAt: new Date(),
          },
    });
};

/** One event's effect on its row; false when the organisation has no such delivery. */
const applyOne = async (tx: Db, event: DeliveryEvent) => {
  const [row] = await tx
    .select()
    .from(emailDeliveries)
    .where(eq(emailDeliveries.id, event.deliveryId))
    .limit(1);

  if (!row) return false;

  if (event.kind === 'deferred') {
    await tx
      .update(emailDeliveries)
      .set({ deferrals: sql`${emailDeliveries.deferrals} + 1`, updatedAt: new Date() })
      .where(eq(emailDeliveries.id, row.id));
    await recordAddress(tx, row.to, event);

    return true;
  }

  const [moved] = await tx
    .update(emailDeliveries)
    .set({
      status: event.kind,
      reportedAt: event.at,
      updatedAt: new Date(),
      ...(event.kind === 'delivered' ? {} : { error: event.detail?.slice(0, 2000) ?? null }),
    })
    .where(
      and(
        eq(emailDeliveries.id, row.id),
        inArray(emailDeliveries.status, [...MOVES_FROM[event.kind]]),
      ),
    )
    .returning();

  // Once per email: a repeated event moves nothing, so it counts nothing.
  if (moved) await recordAddress(tx, row.to, event);

  if (moved && event.kind !== 'delivered') await onTimelines(tx, [moved]);

  if (event.suppress) await suppress(tx, row, event);

  return true;
};

/**
 * Applies one organisation's events in the order they happened, in its scope,
 * so row level security keeps every other organisation's rows out of reach.
 * Answers how many found no delivery.
 */
const applyEvents = (orgId: string, events: DeliveryEvent[]) =>
  withOrg(orgId, async (tx) => {
    let unknown = 0;

    await inOrder(
      events.toSorted((a, b) => a.at.getTime() - b.at.getTime()),
      async (event) => {
        if (!(await applyOne(tx, event))) unknown += 1;
      },
    );

    return unknown;
  });

/** Every organisation's events of a batch, one scope each; answers how many found no delivery. */
export const applyBatch = async (events: DeliveryEvent[]) => {
  let unknown = 0;

  await inOrder(new Set(events.map((event) => event.orgId)), async (orgId) => {
    unknown += await applyEvents(
      orgId,
      events.filter((event) => event.orgId === orgId),
    );
  });

  return unknown;
};
