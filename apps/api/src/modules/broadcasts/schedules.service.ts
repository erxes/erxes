import type { RepeatRule } from '@erxes/core-contract';
import { broadcastSchedules, broadcasts, type Db, type RepeatState } from '@erxes/core-db';
import { and, eq, inArray, isNotNull } from 'drizzle-orm';
import { fail, notFound } from '~/http/errors';
import { orgTimezone } from '~/lib/orgTime';
import { inOrder } from '~/lib/sequence';
import { requireReplyTo } from '~/modules/email/replyTos.service';
import {
  assertComplete,
  assertDeliverable,
  getBroadcast,
  moveBroadcast,
} from './broadcasts.service';
import { nextRunWithin, type RepeatPlan, runsFrom } from './repeatRule';

type ScheduleRow = typeof broadcastSchedules.$inferSelect;

/** The rule's columns, with the table's defaults where the input leaves them out. */
const ruleColumns = (rule: RepeatRule) => ({
  frequency: rule.frequency,
  interval: rule.interval ?? 1,
  weekdays: rule.frequency === 'week' ? (rule.weekdays ?? []).toSorted((a, b) => a - b) : [],
  dayOfMonth: rule.frequency === 'month' ? (rule.dayOfMonth ?? null) : null,
  at: rule.at,
  startsOn: rule.startsOn,
  endsOn: rule.endsOn ?? null,
  maxRuns: rule.maxRuns ?? null,
});

export const getSchedule = async (client: Db, broadcastId: string) => {
  const [row] = await client
    .select()
    .from(broadcastSchedules)
    .where(eq(broadcastSchedules.broadcastId, broadcastId))
    .limit(1);

  return row ?? null;
};

const requireSchedule = async (client: Db, broadcastId: string) => {
  const row = await getSchedule(client, broadcastId);

  if (!row) throw notFound('Schedule');

  return row;
};

/** 400 when the rule never runs from now: its end comes before its next time. */
const firstRun = (plan: RepeatPlan, timeZone: string) => {
  const next = nextRunWithin(plan, timeZone, new Date());

  if (!next) {
    const message = 'It would never run: its end comes before its next time';

    throw fail('INVALID_INPUT', message, { issues: [{ path: ['endsOn'], message }] });
  }

  return next;
};

/** Writes the broadcast's schedule, a new one or over the old. */
const upsertSchedule = (client: Db, values: typeof broadcastSchedules.$inferInsert) =>
  client
    .insert(broadcastSchedules)
    .values(values)
    .onConflictDoUpdate({
      target: broadcastSchedules.broadcastId,
      set: { ...values, updatedAt: new Date() },
    });

/**
 * Makes a draft recurring: checked as sending is (content, email delivery,
 * Reply-To), then its schedule runs from the next time after now.
 */
export const startSchedule = async (tx: Db, id: string, rule: RepeatRule) => {
  const broadcast = await getBroadcast(tx, id);

  assertComplete(broadcast);
  await assertDeliverable(tx, broadcast);
  await requireReplyTo(tx, broadcast.replyTo);

  const columns = ruleColumns(rule);
  const nextRunAt = firstRun({ ...columns, runs: 0 }, await orgTimezone(tx));

  await moveBroadcast(tx, id, ['draft'], { status: 'recurring', scheduledAt: null, error: null });
  await upsertSchedule(tx, {
    broadcastId: id,
    ...columns,
    state: 'active',
    nextRunAt,
    runs: 0,
    lastRunAt: null,
  });

  return requireSchedule(tx, id);
};

/**
 * Changes the rule. A draft keeps it for when it starts; a recurring one's
 * next run follows the new rule (runs already made stay as they are).
 */
export const saveSchedule = async (tx: Db, id: string, rule: RepeatRule) => {
  const { status } = await getBroadcast(tx, id);
  const columns = ruleColumns(rule);

  if (status === 'draft') {
    await upsertSchedule(tx, { broadcastId: id, ...columns, state: 'draft', nextRunAt: null });

    return requireSchedule(tx, id);
  }

  if (status !== 'recurring') {
    throw fail('BROADCAST_STATUS', `The broadcast is ${status}`, { status });
  }

  const current = await requireSchedule(tx, id);

  if (current.state === 'ended') {
    throw fail('REPEAT_STATE', 'The schedule has ended', { state: current.state });
  }

  const plan = { ...columns, runs: current.runs };

  await tx
    .update(broadcastSchedules)
    .set({
      ...columns,
      nextRunAt: current.state === 'active' ? firstRun(plan, await orgTimezone(tx)) : null,
      updatedAt: new Date(),
    })
    .where(eq(broadcastSchedules.broadcastId, id));

  return requireSchedule(tx, id);
};

/**
 * Moves a schedule from one of `from` in one conditional update; 404 without
 * one, 409 REPEAT_STATE when it stands elsewhere.
 */
const moveSchedule = async (
  tx: Db,
  id: string,
  from: readonly RepeatState[],
  set: Partial<typeof broadcastSchedules.$inferInsert>,
) => {
  const moved = await tx
    .update(broadcastSchedules)
    .set({ ...set, updatedAt: new Date() })
    .where(
      and(eq(broadcastSchedules.broadcastId, id), inArray(broadcastSchedules.state, [...from])),
    )
    .returning();

  if (moved[0]) return moved[0];

  const { state } = await requireSchedule(tx, id);

  throw fail('REPEAT_STATE', `The schedule is ${state}`, { state });
};

export const pauseSchedule = (tx: Db, id: string) =>
  moveSchedule(tx, id, ['active'], { state: 'paused', nextRunAt: null });

/** Runs again from the next time after now: the times it was paused through are skipped. */
export const resumeSchedule = async (tx: Db, id: string) => {
  await assertDeliverable(tx, await getBroadcast(tx, id));

  const current = await requireSchedule(tx, id);
  const nextRunAt = nextRunWithin(current, await orgTimezone(tx), new Date());

  return moveSchedule(
    tx,
    id,
    ['paused'],
    nextRunAt ? { state: 'active', nextRunAt } : { state: 'ended', nextRunAt: null },
  );
};

export const stopSchedule = (tx: Db, id: string) =>
  moveSchedule(tx, id, ['active', 'paused'], { state: 'ended', nextRunAt: null });

/** The rule's next `count` times from now, within its end, on the organisation's clock. */
export const previewSchedule = async (client: Db, rule: RepeatRule & { count: number }) => {
  const plan = { ...ruleColumns(rule), runs: 0 };
  const timeZone = await orgTimezone(client);
  const first = nextRunWithin(plan, timeZone, new Date());

  return { runs: runsFrom(plan, timeZone, { first, count: rule.count }) };
};

/** Runs one recurring broadcast shows on the calendar at most. */
const RUNS_PER_SCHEDULE = 100;

/** Runs of active recurring broadcasts not made yet in a window (the calendar's six weeks). */
export const upcomingRuns = async (client: Db, window: { from: string; to: string }) => {
  const from = new Date(window.from);
  const until = new Date(window.to);
  const timeZone = await orgTimezone(client);

  const active = await client
    .select({
      schedule: broadcastSchedules,
      name: broadcasts.name,
      channel: broadcasts.channel,
    })
    .from(broadcastSchedules)
    .innerJoin(broadcasts, eq(broadcasts.id, broadcastSchedules.broadcastId))
    .where(and(eq(broadcastSchedules.state, 'active'), isNotNull(broadcastSchedules.nextRunAt)));

  const data = active.flatMap(({ schedule, name, channel }) =>
    runsFrom(schedule, timeZone, {
      first: schedule.nextRunAt,
      until,
      count: RUNS_PER_SCHEDULE,
    })
      .filter((at) => at >= from)
      .map((at) => ({ broadcastId: schedule.broadcastId, name, channel, at })),
  );

  return { data: data.toSorted((a, b) => a.at.getTime() - b.at.getTime()).slice(0, 1000) };
};

/**
 * A recurring broadcast's copy: a draft with its rule, not turned on, so
 * duplicating never starts sending.
 */
export const copySchedule = async (tx: Db, sourceId: string, copyId: string) => {
  const source = await getSchedule(tx, sourceId);

  if (!source) return;

  const { frequency, interval, weekdays, dayOfMonth, at, startsOn, endsOn, maxRuns } = source;

  await tx.insert(broadcastSchedules).values({
    broadcastId: copyId,
    frequency,
    interval,
    weekdays,
    dayOfMonth,
    at,
    startsOn,
    endsOn,
    maxRuns,
    state: 'draft',
  });
};

/** Sending once instead: a draft's saved rule goes. */
export const dropDraftSchedule = (tx: Db, id: string) =>
  tx
    .delete(broadcastSchedules)
    .where(and(eq(broadcastSchedules.broadcastId, id), eq(broadcastSchedules.state, 'draft')));

/** The organisation's time zone changed: active schedules' next runs move to its clock. */
export const rescheduleBroadcasts = async (tx: Db, timeZone: string) => {
  const active = await tx
    .select()
    .from(broadcastSchedules)
    .where(eq(broadcastSchedules.state, 'active'));

  await inOrder(active, (schedule: ScheduleRow) => {
    const nextRunAt = nextRunWithin(schedule, timeZone, new Date());

    return tx
      .update(broadcastSchedules)
      .set(nextRunAt ? { nextRunAt } : { state: 'ended', nextRunAt: null })
      .where(eq(broadcastSchedules.broadcastId, schedule.broadcastId));
  });
};
