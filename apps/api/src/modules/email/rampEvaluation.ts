import { type Db, emailDeliveries, emailRamps, withOrg, withSystem } from '@erxes/core-db';
import { gte, inArray, sql } from 'drizzle-orm';
import { inOrder } from '~/lib/sequence';
import { logger } from '~/logger';
import { defineSchedule } from '~/modules/jobs/jobs';
import { isActive, limitOf, RAMP_RULES, type RampRow, rampMode, rampOf } from './ramp';
import { noticeHalted, noticeMissingEventsKey } from './rampNotices';

const log = logger.child({ component: 'email ramp' });

const DAY = 24 * 60 * 60 * 1000;

/** Emails the server took; of them, the provider reported these bounced or marked as spam. */
const TAKEN = ['sent', 'delivered', 'bounced', 'complained'] as const;

/** Where the rates count from: the window, or since sending was resumed. */
export const windowStart = (ramp: RampRow, now = new Date()) => {
  const start = new Date(now.getTime() - RAMP_RULES.windowDays * DAY);

  return ramp.resumedAt && ramp.resumedAt > start ? ramp.resumedAt : start;
};

/** Emails taken, bounced and complained about since `since`, from the delivery log. */
export const windowStats = async (client: Db, since: Date) => {
  const [row] = await client
    .select({
      sent: sql<number>`count(*) filter (where ${inArray(emailDeliveries.status, [...TAKEN])})`.mapWith(
        Number,
      ),
      bounced: sql<number>`count(*) filter (where ${emailDeliveries.status} = 'bounced')`.mapWith(
        Number,
      ),
      complained:
        sql<number>`count(*) filter (where ${emailDeliveries.status} = 'complained')`.mapWith(
          Number,
        ),
    })
    .from(emailDeliveries)
    .where(gte(emailDeliveries.createdAt, since));

  const sent = row?.sent ?? 0;
  const bounced = row?.bounced ?? 0;
  const complained = row?.complained ?? 0;

  return { since, sent, bounced, complained, rate: sent ? (bounced + complained) / sent : 0 };
};

type WindowStats = Awaited<ReturnType<typeof windowStats>>;

/** Emails the window must hold before the limit may go up: a day's worth of the current step. */
export const advanceSample = (tier: number) => Math.max(RAMP_RULES.minSample, limitOf(tier));

/** The tier may move once a day: when it may next. */
export const nextMoveAt = (ramp: RampRow) =>
  ramp.tierChangedAt ? new Date(ramp.tierChangedAt.getTime() + DAY) : null;

type Judgement = { halt: string; percent: string; sent: number } | { tier: number } | null;

/** What the window's rates say for the ramp: halt, a step down or up, or nothing. */
const judge = (ramp: RampRow, stats: WindowStats, now = new Date()): Judgement => {
  if (ramp.haltedAt) return null;

  const judged = stats.sent >= RAMP_RULES.minSample;
  const movable = (nextMoveAt(ramp) ?? now) <= now;
  const percent = (stats.rate * 100).toFixed(1);

  if (judged && stats.rate >= RAMP_RULES.haltAt) {
    return {
      halt: `Bounces and complaints reached ${percent}% of ${stats.sent} emails over the last ${RAMP_RULES.windowDays} days`,
      percent,
      sent: stats.sent,
    };
  }

  if (judged && stats.rate >= RAMP_RULES.stepDownAt)
    return movable && ramp.tier > 0 ? { tier: ramp.tier - 1 } : null;

  const top = RAMP_RULES.tiers.length - 1;

  if (
    stats.rate < RAMP_RULES.advanceBelow &&
    stats.sent >= advanceSample(ramp.tier) &&
    movable &&
    ramp.tier < top
  )
    return { tier: ramp.tier + 1 };

  return null;
};

/**
 * Measures the scope's organisation's rates and moves its ramp: up or down a
 * step, or halted (admins told once). Off or unmeasured ramps only note the
 * time. Then tells admins, once, if the provider's events are refused for want of a key.
 */
export const evaluateRamp = async (client: Db) => {
  const ramp = await rampOf(client, true);
  const active = isActive(await rampMode(client), ramp);
  const verdict = active ? judge(ramp, await windowStats(client, windowStart(ramp))) : null;

  await client.update(emailRamps).set({
    evaluatedAt: new Date(),
    ...(verdict && 'tier' in verdict ? { tier: verdict.tier, tierChangedAt: new Date() } : {}),
    ...(verdict && 'halt' in verdict ? { haltedAt: new Date(), haltReason: verdict.halt } : {}),
    updatedAt: new Date(),
  });

  if (verdict && 'halt' in verdict) await noticeHalted(client, verdict);

  if (verdict && 'tier' in verdict)
    log.info({ from: ramp.tier, to: verdict.tier }, 'email ramp moved a step');

  await noticeMissingEventsKey(client);

  return verdict;
};

/** Every organisation that sent email, each in its own scope; one that fails doesn't stop the rest. */
const evaluateRamps = async () => {
  const orgIds = await withSystem('email ramp', (tx) =>
    tx.select({ orgId: emailRamps.orgId }).from(emailRamps),
  );

  await inOrder(orgIds, async ({ orgId }) => {
    try {
      await withOrg(orgId, (tx) => evaluateRamp(tx));
    } catch (error) {
      log.error({ err: error, orgId }, 'email ramp not evaluated');
    }
  });
};

/** Measures every ramp every `evaluateMinutes`. */
export const rampSchedule = defineSchedule({
  queue: 'email.ramp',
  cron: `*/${RAMP_RULES.evaluateMinutes} * * * *`,
  run: evaluateRamps,
});
