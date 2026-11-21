import { callerUserId, type Db, emailDeliveries, emailRamps } from '@erxes/core-db';
import { EMAIL_AUTH_SOURCES } from '@erxes/core-db/emailEnums';
import { count, eq } from 'drizzle-orm';
import { config } from '~/config';
import { fail } from '~/http/errors';
import { recordAudit } from '~/modules/audit/audit.service';
import { deliverJob } from '~/modules/broadcasts/delivery';
import { startWaitingNow } from '~/modules/jobs/waiting';
import { unprovenSentLastHour } from './addresses';
import { emailJob } from './email';
import { isActive, limitOf, nextWindow, RAMP_RULES, rampMode, rampOf, sendingRoom } from './ramp';
import {
  advanceSample,
  evaluateRamp,
  nextMoveAt,
  windowStart,
  windowStats,
} from './rampEvaluation';
import { noticeResumed } from './rampNotices';

/** Rates older than this are measured again when the page asks. */
const STALE_MS = RAMP_RULES.evaluateMinutes * 60_000;

/** Held emails and paused broadcasts go out now (each checks the ramp again). */
const releaseHeld = (client: Db) => startWaitingNow(client, [emailJob.queue, deliverJob.queue]);

/** A time still ahead, else null. */
const waitUntil = (when: Date | null) => (when && when.getTime() > Date.now() ? when : null);

/** The sending ramp as Settings shows it; measured first when the last measure is old. */
export const getLimits = async (client: Db) => {
  const before = await rampOf(client);

  if (!before.evaluatedAt || Date.now() - before.evaluatedAt.getTime() > STALE_MS)
    await evaluateRamp(client);

  const ramp = await rampOf(client);
  const mode = await rampMode(client);
  const stats = await windowStats(client, windowStart(ramp));
  const top = ramp.tier >= RAMP_RULES.tiers.length - 1;

  const [held] = await client
    .select({ count: count() })
    .from(emailDeliveries)
    .where(eq(emailDeliveries.status, 'held'));

  return {
    ...ramp,
    ...mode,
    active: isActive(mode, ramp),
    tiers: [...RAMP_RULES.tiers],
    limit: limitOf(ramp.tier),
    held: held?.count ?? 0,
    nextWindowAt: nextWindow(ramp),
    windowSince: stats.since,
    windowDays: RAMP_RULES.windowDays,
    windowSent: stats.sent,
    windowBounced: stats.bounced,
    windowComplained: stats.complained,
    rate: stats.rate,
    advanceBelow: RAMP_RULES.advanceBelow,
    stepDownAt: RAMP_RULES.stepDownAt,
    haltAt: RAMP_RULES.haltAt,
    minSample: RAMP_RULES.minSample,
    advanceSentNeeded: top ? null : advanceSample(ramp.tier),
    advanceNotBefore: top ? null : waitUntil(nextMoveAt(ramp)),
    authCapPerHour: config.email.authHourlyCap,
    authUnprovenLastHour: await unprovenSentLastHour(client, EMAIL_AUTH_SOURCES),
  };
};

/** Whether emails wait now: for any member (a broadcast's page). */
export const getPacing = async (client: Db) => {
  const { room, halted, until } = await sendingRoom(client);

  return { halted, limitReached: !halted && room <= 0, until };
};

/**
 * Lifts a halt, saying why (audited): the limit goes down a step from where
 * it halted, the rates count from now, and held emails go out.
 */
export const resumeSending = async (client: Db, reason: string) => {
  const ramp = await rampOf(client, true);

  if (ramp.haltedAt) {
    const tier = Math.max(0, ramp.tier - 1);

    await client.update(emailRamps).set({
      haltedAt: null,
      haltReason: null,
      tier,
      tierChangedAt: new Date(),
      resumedAt: new Date(),
      resumedBy: callerUserId(),
      resumeReason: reason,
      updatedAt: new Date(),
    });

    await recordAudit(client, {
      action: 'email.sending_resumed',
      targetType: 'email_ramp',
      targetId: ramp.orgId,
      metadata: { reason, haltReason: ramp.haltReason, fromTier: ramp.tier, toTier: tier },
    });

    await noticeResumed(client, reason);
    await releaseHeld(client);
  }

  return getLimits(client);
};

/**
 * Turns the ramp off or on (audited). Only self-hosted, sending through its
 * own SendGrid or SES: on SaaS it is always on; an SMTP server reports no
 * bounces to measure. Off, held emails go out now.
 */
export const setRamp = async (client: Db, enabled: boolean) => {
  if (config.saas.enabled)
    throw fail('NOT_IN_PLAN', 'Sending through erxes is always paced by the sending ramp');

  if (!(await rampMode(client)).canTurnOff) {
    const message =
      'Only an organisation sending through its own SendGrid or Amazon SES can turn the ramp off';

    throw fail('INVALID_INPUT', message, { issues: [{ path: ['enabled'], message }] });
  }

  const ramp = await rampOf(client, true);

  if (ramp.enabled !== enabled) {
    await client.update(emailRamps).set({ enabled, updatedAt: new Date() });

    await recordAudit(client, {
      action: enabled ? 'email.ramp_turned_on' : 'email.ramp_turned_off',
      targetType: 'email_ramp',
      targetId: ramp.orgId,
    });

    if (!enabled) await releaseHeld(client);
  }

  return getLimits(client);
};
