import {
  emailDeliveries,
  emailRamps,
  emailSettings,
  newId,
  notifications,
  organizations,
} from '@erxes/core-db';
import type { EMAIL_DELIVERY_STATUSES } from '@erxes/core-db/emailEnums';
import { eq, sql } from 'drizzle-orm';
import { beforeEach } from 'vite-plus/test';
import { useBroadcasts } from './broadcasts.fixture';
import { adminDb } from './db';

type Status = (typeof EMAIL_DELIVERY_STATUSES)[number];

/**
 * Acme and Globex (`useBroadcasts`), with Acme's sending ramp, delivery log,
 * own settings and notifications reset before each test.
 */
export const useEmailRamp = () => {
  const t = useBroadcasts();

  /** Acme's day: its ramp counts by its time zone. */
  const acmeToday = () =>
    sql`(now() at time zone (select timezone from core_organizations where id = ${t.ids.org}))::date`;

  /** Acme's ramp as the given fixture says, on UTC; its log, settings and notifications empty. */
  const resetAcme = async (ramp: Partial<typeof emailRamps.$inferInsert> = {}) => {
    await adminDb()
      .update(organizations)
      .set({ timezone: 'UTC' })
      .where(eq(organizations.id, t.ids.org));
    await adminDb().delete(emailDeliveries).where(eq(emailDeliveries.orgId, t.ids.org));
    await adminDb().delete(emailSettings).where(eq(emailSettings.orgId, t.ids.org));
    await adminDb().delete(notifications).where(eq(notifications.orgId, t.ids.org));
    await adminDb()
      .insert(emailRamps)
      .values({ orgId: t.ids.org, ...ramp })
      .onConflictDoUpdate({
        target: emailRamps.orgId,
        set: {
          tier: 0,
          enabled: true,
          sentToday: 0,
          day: acmeToday(),
          tierChangedAt: null,
          evaluatedAt: null,
          haltedAt: null,
          haltReason: null,
          resumedAt: null,
          cappedNoticeAt: null,
          limitNoticeDay: null,
          eventsNoticeAt: null,
          ...ramp,
        },
      });
  };

  /** Synthetic sent emails in Acme's log, as the provider's events left them. */
  const logged = (count: number, status: Status) =>
    adminDb()
      .insert(emailDeliveries)
      .values(
        Array.from({ length: count }, (_, index) => ({
          id: newId(),
          orgId: t.ids.org,
          source: 'broadcast' as const,
          to: `${status}-${index}@log.mn`,
          subject: 'Logged',
          status,
        })),
      );

  /** The Limits page, measured now (as the schedule would). */
  const measured = async () => {
    await adminDb()
      .update(emailRamps)
      .set({ evaluatedAt: null })
      .where(eq(emailRamps.orgId, t.ids.org));

    return t.owner().emails.limits();
  };

  const deliveryTo = async (to: string) =>
    (await t.owner().emails.deliveries({ search: to })).data.find((row) => row.to === to);

  /** Acme's next day: today's count starts over. */
  const nextDay = () =>
    adminDb()
      .update(emailRamps)
      .set({ day: sql`${acmeToday()} - 1` })
      .where(eq(emailRamps.orgId, t.ids.org));

  beforeEach(() => resetAcme());

  return { ...t, resetAcme, logged, measured, deliveryTo, nextDay };
};
