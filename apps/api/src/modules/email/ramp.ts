import { type Db, emailRamps, emailSettings } from '@erxes/core-db';
import {
  EMAIL_AUTH_SOURCES,
  type EMAIL_HOLD_REASONS,
  EMAIL_RAMP_TIERS,
  type EMAIL_SOURCES,
} from '@erxes/core-db/emailEnums';
import { getTableColumns, isNull, lt, ne, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import { config } from '~/config';
import { nextMidnight, orgTimezoneSql, orgTodaySql } from '~/lib/orgTime';
import { enqueueJob } from '~/modules/jobs/jobs';
import { laneOf, unprovenSentLastHour } from './addresses';
import { serverProvider } from './transport';

type EmailSource = (typeof EMAIL_SOURCES)[number];

type HoldReason = (typeof EMAIL_HOLD_REASONS)[number];

/**
 * The sending ramp's rules. Rates are bounces and complaints over emails the
 * server took, counted from the delivery log over `windowDays` (or since an
 * admin resumed sending). Below `advanceBelow` the daily limit goes up one
 * step, once a day at most and only after the window holds a day's worth of
 * the current step (so a quiet organisation doesn't climb unproven). At
 * `stepDownAt` it goes down one step, once a day at most; at `haltAt` all but
 * sign-in and account email stops until an admin resumes. Fewer than
 * `minSample` emails in the window say nothing either way.
 */
export const RAMP_RULES = {
  tiers: EMAIL_RAMP_TIERS,
  windowDays: 7,
  advanceBelow: 0.02,
  stepDownAt: 0.05,
  haltAt: 0.1,
  minSample: 100,
  /** How often the schedule measures; the Limits page measures when it is older. */
  evaluateMinutes: 10,
} as const;

/** The organisation's day: its allowance starts at its midnight. */
const TODAY = orgTodaySql(emailRamps.orgId);

export type RampRow = typeof emailRamps.$inferSelect & { timezone: string };

/** Emails a day at a step. */
export const limitOf = (tier: number) =>
  EMAIL_RAMP_TIERS[Math.min(Math.max(tier, 0), EMAIL_RAMP_TIERS.length - 1)] ?? EMAIL_RAMP_TIERS[0];

/** When the next day's allowance opens: the organisation's next midnight. */
export const nextWindow = (ramp: RampRow, now = new Date()) => nextMidnight(ramp.timezone, now);

export const isAuthSource = (source: EmailSource) =>
  EMAIL_AUTH_SOURCES.some((auth) => auth === source);

/**
 * The scope's organisation's ramp, written on first use, with `sentToday`
 * as of the organisation's today (0 on its new day) and its time zone.
 * `lock` holds the row for the caller's transaction: counting and deciding
 * are one step.
 */
export const rampOf = async (client: Db, lock = false): Promise<RampRow> => {
  const read = () => {
    const query = client
      .select({
        ...getTableColumns(emailRamps),
        sentToday:
          sql<number>`case when ${emailRamps.day} = ${TODAY} then ${emailRamps.sentToday} else 0 end`
            .mapWith(Number)
            .as('sent_today'),
        timezone: orgTimezoneSql(emailRamps.orgId).as('timezone'),
      })
      .from(emailRamps)
      .limit(1);

    return lock ? query.for('update') : query;
  };

  const [found] = await read();

  if (found) return found;

  await client.insert(emailRamps).values({ tier: 0 }).onConflictDoNothing();

  const [created] = await read();

  if (!created) throw new Error('the email ramp row was not written');

  return created;
};

/**
 * Whether the ramp can measure and may be turned off. SaaS: always on.
 * Self-hosted: an organisation sending through its own SendGrid or SES may
 * turn it off; an SMTP server reports no bounces, so there it is off.
 */
export const rampMode = async (client: Db) => {
  const [own] = config.saas.enabled
    ? []
    : await client.select({ provider: emailSettings.provider }).from(emailSettings).limit(1);

  const provider = own?.provider ?? serverProvider();

  return {
    provider,
    measured: config.saas.enabled || provider !== 'smtp',
    canTurnOff: own?.provider === 'sendgrid' || own?.provider === 'ses',
  };
};

export type RampMode = Awaited<ReturnType<typeof rampMode>>;

/** Pacing and halting apply now. */
export const isActive = (mode: RampMode, ramp: RampRow) =>
  mode.measured && (ramp.enabled || !mode.canTurnOff);

/** Adds emails let through to today's count (a new day starts from them). */
export const countSent = async (client: Db, count: number) => {
  if (!count) return;

  await client.update(emailRamps).set({
    sentToday: sql`greatest(0, case when ${emailRamps.day} = ${TODAY} then ${emailRamps.sentToday} else 0 end + ${count})`,
    day: sql`${TODAY}`,
    updatedAt: new Date(),
  });
};

/**
 * The organisation's time zone changed: today's count moves to the new zone's
 * today, so a change of zone never starts a fresh allowance.
 */
export const carryRampDay = (tx: Db, from: string, to: string) => {
  const before = sql`(now() at time zone ${from})::date`;
  const after = sql`(now() at time zone ${to})::date`;

  return tx
    .update(emailRamps)
    .set({
      day: after,
      limitNoticeDay: sql`case when ${emailRamps.limitNoticeDay} = ${before} then ${after} else ${emailRamps.limitNoticeDay} end`,
    })
    .where(sql`${emailRamps.day} = ${before}`);
};

/** What the ramp does with an email it doesn't let through now. */
export type RampHold =
  | { status: 'held'; reason: HoldReason; until: Date }
  | { status: 'capped'; reason: 'unproven_hourly' };

interface Admitted {
  id: string;
  to: string;
}

/**
 * The queue that tells admins what queuing just did (`rampNotices.ts` works
 * it): queuing can't notify itself, notifications send email.
 */
export const RAMP_NOTICE_QUEUE = 'email.ramp.notice';

export const RampNotice = z.discriminatedUnion('notice', [
  z.object({ notice: z.literal('limit_reached'), limit: z.int() }),
  z.object({ notice: z.literal('capped'), cap: z.int() }),
]);

const queueNotice = (client: Db, orgId: string, payload: z.input<typeof RampNotice>) =>
  enqueueJob(client, { orgId, queue: RAMP_NOTICE_QUEUE, payload });

/** Sign-in emails hit their cap: admins told at most once an hour (the row claims the hour). */
const claimCappedNotice = async (client: Db, orgId: string) => {
  const [claimed] = await client
    .update(emailRamps)
    .set({ cappedNoticeAt: new Date() })
    .where(
      or(
        isNull(emailRamps.cappedNoticeAt),
        lt(emailRamps.cappedNoticeAt, sql`now() - interval '1 hour'`),
      ),
    )
    .returning({ orgId: emailRamps.orgId });

  if (claimed)
    await queueNotice(client, orgId, { notice: 'capped', cap: config.email.authHourlyCap });
};

/** The day's limit is used: admins told once a day (the organisation's). */
const claimLimitNotice = async (client: Db, ramp: RampRow) => {
  const [claimed] = await client
    .update(emailRamps)
    .set({ limitNoticeDay: sql`${TODAY}` })
    .where(or(isNull(emailRamps.limitNoticeDay), ne(emailRamps.limitNoticeDay, TODAY)))
    .returning({ orgId: emailRamps.orgId });

  if (claimed)
    await queueNotice(client, ramp.orgId, { notice: 'limit_reached', limit: limitOf(ramp.tier) });
};

/** Sign-in emails to unproven addresses past the hourly cap are stopped. */
const capAuth = async (client: Db, emails: Admitted[]) => {
  const lanes = await laneOf(
    client,
    emails.map((email) => email.to),
  );

  const unproven = emails.filter((email) => lanes.get(email.to.toLowerCase()) !== 'proven');

  if (!unproven.length) return [];

  const used = await unprovenSentLastHour(client, EMAIL_AUTH_SOURCES);

  return unproven
    .slice(Math.max(0, config.email.authHourlyCap - used))
    .map((email) => [email.id, { status: 'capped', reason: 'unproven_hourly' }] as const);
};

/**
 * The ramp's say on emails about to be queued, in the caller's transaction
 * (the ramp row stays locked until it ends). Every email counts. Sign-in and
 * account emails are never held; past the hourly cap to unproven addresses
 * they are not sent. The rest are held while sending is halted, and past
 * the day's limit until the next day's allowance. Answers the ones not let
 * through now.
 */
export const admitEmails = async (client: Db, source: EmailSource, emails: Admitted[]) => {
  const holds = new Map<string, RampHold>();

  if (!emails.length) return holds;

  const ramp = await rampOf(client, true);
  const active = isActive(await rampMode(client), ramp);

  if (active && isAuthSource(source)) {
    const capped = await capAuth(client, emails);

    for (const [id, hold] of capped) holds.set(id, hold);

    if (capped.length) await claimCappedNotice(client, ramp.orgId);
  } else if (active) {
    const room = ramp.haltedAt ? 0 : Math.max(0, limitOf(ramp.tier) - ramp.sentToday);
    const reason = ramp.haltedAt ? 'halted' : 'daily_limit';

    for (const email of emails.slice(room))
      holds.set(email.id, { status: 'held', reason, until: nextWindow(ramp) });

    // These use the day's last room (or wait for the next): the limit is reached.
    if (!ramp.haltedAt && emails.length >= room) await claimLimitNotice(client, ramp);
  }

  await countSent(client, emails.length - holds.size);

  return holds;
};

/** How much the organisation may send now: for a broadcast deciding how many to take. */
export const sendingRoom = async (client: Db) => {
  const ramp = await rampOf(client);
  const mode = await rampMode(client);

  if (!isActive(mode, ramp)) return { room: Infinity, halted: false, until: null };

  if (ramp.haltedAt) return { room: 0, halted: true, until: nextWindow(ramp) };

  const room = Math.max(0, limitOf(ramp.tier) - ramp.sentToday);

  return { room, halted: false, until: room ? null : nextWindow(ramp) };
};
